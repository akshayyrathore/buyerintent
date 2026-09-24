from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from database import db
from auth import hash_password, verify_password, create_access_token, decode_token
from twitter_client import TwitterClient
from intent_engine import IntentEngine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize services
twitter_client = TwitterClient()
intent_engine = IntentEngine()

# Create the main app
app = FastAPI(title="Twitter Buyer-Intent Intelligence API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic Models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    email: str
    user_id: int

class SearchRequest(BaseModel):
    location: str
    category: str
    keywords: List[str]

class TweetResponse(BaseModel):
    tweet_id: str
    text: str
    username: str
    name: str
    created_at: str
    engagement_metrics: Dict[str, Any]
    intent_score: float
    intent_label: str
    location_confidence: float
    category_match: bool
    reasoning: str

class SearchResponse(BaseModel):
    search_query: str
    expanded_terms: Dict[str, List[str]]
    tweets: List[TweetResponse]
    count: int
    datasets_created: int

# Auth dependency
async def get_current_user(authorization: Optional[str] = Header(None)) -> int:
    """Verify JWT token and return user_id"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload.get("user_id")

# Routes
@api_router.get("/")
async def root():
    return {
        "message": "Twitter Buyer-Intent Intelligence API",
        "version": "1.0.0",
        "status": "operational"
    }

@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """Create new user account"""
    # Check if user already exists
    existing_user = await db.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    password_hash = hash_password(request.password)
    user = await db.create_user(request.email, password_hash)
    
    # Create JWT token
    token = create_access_token({"user_id": user['id'], "email": user['email']})
    
    return AuthResponse(
        token=token,
        email=user['email'],
        user_id=user['id']
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """User login"""
    # Get user from database
    user = await db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(request.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create JWT token
    token = create_access_token({"user_id": user['id'], "email": user['email']})
    
    return AuthResponse(
        token=token,
        email=user['email'],
        user_id=user['id']
    )

@api_router.post("/search/twitter", response_model=SearchResponse)
async def search_twitter(
    request: SearchRequest,
    user_id: int = Depends(get_current_user)
):
    """Main search endpoint - searches Twitter for buyer intent"""
    try:
        # Step 1: Expand search intent using LLM
        logger.info(f"Expanding search intent for user {user_id}")
        expanded = await intent_engine.expand_search_intent(
            request.location,
            request.category,
            request.keywords
        )
        
        # Step 2: Build Twitter search query
        search_query = twitter_client.build_search_query(
            expanded.get('location_terms', [request.location]),
            expanded.get('category_terms', request.keywords),
            expanded.get('intent_terms', ['looking for', 'need', 'recommend'])
        )
        
        logger.info(f"Twitter search query: {search_query}")
        
        # Step 3: Search tweets
        twitter_response = await twitter_client.search_tweets(search_query, max_results=20)
        
        if 'error' in twitter_response:
            error_msg = twitter_response['error']
            # Handle rate limit specifically
            if 'Rate limit exceeded' in error_msg or 'rate limit' in error_msg.lower():
                raise HTTPException(
                    status_code=429, 
                    detail="Twitter API rate limit reached (100 requests/month on Basic tier). Please try again later or wait for the monthly reset."
                )
            raise HTTPException(status_code=500, detail=error_msg)
        
        # Step 4: Analyze each tweet for intent
        analyzed_tweets = []
        datasets_created = 0
        
        for tweet in twitter_response['tweets']:
            # Analyze intent
            analysis = await intent_engine.analyze_tweet_intent(
                tweet['text'],
                request.location,
                request.category
            )
            
            # Only include tweets with category match or medium+ intent
            if analysis.get('category_match', False) or analysis.get('intent_score', 0) >= 0.5:
                # Store tweet in database
                tweet_data = {
                    'tweet_id': tweet['tweet_id'],
                    'text': tweet['text'],
                    'username': tweet['username'],
                    'created_at': tweet['created_at'],
                    'engagement_metrics': tweet['engagement_metrics'],
                    'location_confidence': analysis.get('location_confidence', 0.0),
                    'intent_score': analysis.get('intent_score', 0.0),
                    'category': request.category,
                    'raw_json': tweet['raw_json']
                }
                await db.create_tweet(tweet_data)
                
                # Create dataset entry
                await db.create_intent_dataset(
                    tweet['tweet_id'],
                    analysis.get('intent_label', 'low'),
                    analysis.get('reasoning', '')
                )
                datasets_created += 1
                
                # Add to response
                analyzed_tweets.append(TweetResponse(
                    tweet_id=tweet['tweet_id'],
                    text=tweet['text'],
                    username=tweet['username'],
                    name=tweet.get('name', tweet['username']),
                    created_at=tweet['created_at'],
                    engagement_metrics=tweet['engagement_metrics'],
                    intent_score=analysis.get('intent_score', 0.0),
                    intent_label=analysis.get('intent_label', 'low'),
                    location_confidence=analysis.get('location_confidence', 0.0),
                    category_match=analysis.get('category_match', False),
                    reasoning=analysis.get('reasoning', '')
                ))
        
        # Step 5: Store search query
        await db.create_search_query(
            user_id,
            request.location,
            request.category,
            request.keywords
        )
        
        # Sort by intent score (highest first)
        analyzed_tweets.sort(key=lambda x: x.intent_score, reverse=True)
        
        return SearchResponse(
            search_query=search_query,
            expanded_terms=expanded,
            tweets=analyzed_tweets,
            count=len(analyzed_tweets),
            datasets_created=datasets_created
        )
    
    except Exception as e:
        logger.error(f"Error in search endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/history")
async def get_search_history(
    user_id: int = Depends(get_current_user),
    limit: int = 20
):
    """Get user's search history"""
    history = await db.get_search_history(user_id, limit)
    return {"history": history, "count": len(history)}

@api_router.get("/datasets")
async def get_datasets(
    user_id: int = Depends(get_current_user),
    limit: int = 100
):
    """Get intent datasets for training/evaluation"""
    datasets = await db.get_datasets(limit)
    return {"datasets": datasets, "count": len(datasets)}

@api_router.get("/twitter/rate-limit-info")
async def get_rate_limit_info():
    """Get Twitter API rate limit information"""
    return {
        "tier": "Basic (Free)",
        "monthly_limit": 100,
        "warning": "You are on Twitter Basic tier with 100 requests/month. Use searches wisely!",
        "recommendation": "Upgrade to Twitter API Pro ($5000/month) for 1M requests"
    }

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    logger.info("Connecting to database...")
    await db.connect()
    logger.info("Database connected successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    logger.info("Closing database connection...")
    await db.close()
    logger.info("Database connection closed")

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
