import asyncpg
import os
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import json

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create database connection pool"""
        self.pool = await asyncpg.create_pool(
            os.environ['POSTGRES_URL'],
            min_size=1,
            max_size=10,
            command_timeout=60
        )
        await self.create_tables()
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
    
    async def create_tables(self):
        """Create all required tables"""
        async with self.pool.acquire() as conn:
            # Users table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Search queries table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS search_queries (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    location VARCHAR(255),
                    category VARCHAR(255),
                    keywords TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tweets table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS tweets (
                    id SERIAL PRIMARY KEY,
                    tweet_id VARCHAR(255) UNIQUE NOT NULL,
                    text TEXT NOT NULL,
                    username VARCHAR(255),
                    created_at TIMESTAMP WITH TIME ZONE,
                    engagement_metrics JSONB,
                    location_confidence FLOAT,
                    intent_score FLOAT,
                    category VARCHAR(255),
                    raw_json JSONB
                )
            ''')
            
            # Intent datasets table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS intent_datasets (
                    id SERIAL PRIMARY KEY,
                    tweet_id VARCHAR(255) REFERENCES tweets(tweet_id) ON DELETE CASCADE,
                    intent_label VARCHAR(50),
                    reasoning TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')
    
    # User operations
    async def create_user(self, email: str, password_hash: str) -> Dict[str, Any]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
                email, password_hash
            )
            return dict(row)
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
                email
            )
            return dict(row) if row else None
    
    # Search query operations
    async def create_search_query(self, user_id: int, location: str, category: str, keywords: List[str]) -> int:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'INSERT INTO search_queries (user_id, location, category, keywords) VALUES ($1, $2, $3, $4) RETURNING id',
                user_id, location, category, json.dumps(keywords)
            )
            return row['id']
    
    async def get_search_history(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                'SELECT id, location, category, keywords, created_at FROM search_queries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
                user_id, limit
            )
            return [dict(row) for row in rows]
    
    # Tweet operations
    async def create_tweet(self, tweet_data: Dict[str, Any]) -> int:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                '''INSERT INTO tweets (tweet_id, text, username, created_at, engagement_metrics, 
                   location_confidence, intent_score, category, raw_json) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                   ON CONFLICT (tweet_id) DO UPDATE SET 
                   intent_score = EXCLUDED.intent_score,
                   location_confidence = EXCLUDED.location_confidence
                   RETURNING id''',
                tweet_data['tweet_id'],
                tweet_data['text'],
                tweet_data['username'],
                tweet_data['created_at'],
                json.dumps(tweet_data.get('engagement_metrics', {})),
                tweet_data.get('location_confidence', 0.0),
                tweet_data.get('intent_score', 0.0),
                tweet_data.get('category', ''),
                json.dumps(tweet_data.get('raw_json', {}))
            )
            return row['id']
    
    # Intent dataset operations
    async def create_intent_dataset(self, tweet_id: str, intent_label: str, reasoning: str) -> int:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'INSERT INTO intent_datasets (tweet_id, intent_label, reasoning) VALUES ($1, $2, $3) RETURNING id',
                tweet_id, intent_label, reasoning
            )
            return row['id']
    
    async def get_datasets(self, limit: int = 100) -> List[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                '''SELECT d.id, d.tweet_id, d.intent_label, d.reasoning, d.created_at,
                   t.text, t.username, t.intent_score
                   FROM intent_datasets d
                   JOIN tweets t ON d.tweet_id = t.tweet_id
                   ORDER BY d.created_at DESC LIMIT $1''',
                limit
            )
            return [dict(row) for row in rows]

db = Database()