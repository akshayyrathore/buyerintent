import httpx
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class TwitterClient:
    def __init__(self):
        self.bearer_token = os.environ['TWITTER_BEARER_TOKEN']
        self.base_url = "https://api.twitter.com/2"
        self.headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json"
        }
    
    def build_search_query(
        self,
        location_terms: List[str],
        category_terms: List[str],
        intent_terms: List[str]
    ) -> str:
        """Build optimized Boolean Twitter search query"""
        # Build OR groups for each component
        location_query = ' OR '.join([f'"{term}"' if ' ' in term else term for term in location_terms])
        category_query = ' OR '.join([f'"{term}"' if ' ' in term else term for term in category_terms])
        intent_query = ' OR '.join([f'"{phrase}"' for phrase in intent_terms])
        
        # Combine with AND logic
        query_parts = []
        if location_query:
            query_parts.append(f"({location_query})")
        if category_query:
            query_parts.append(f"({category_query})")
        if intent_query:
            query_parts.append(f"({intent_query})")
        
        query = ' '.join(query_parts)
        query += ' -is:retweet lang:en'
        
        return query
    
    async def search_tweets(
        self,
        query: str,
        max_results: int = 20,
        hours_ago: int = 24
    ) -> Dict[str, Any]:
        """Search recent tweets using Twitter API v2"""
        start_time = (datetime.utcnow() - timedelta(hours=hours_ago)).isoformat("T") + "Z"
        
        params = {
            "query": query,
            "max_results": min(max_results, 100),
            "start_time": start_time,
            "tweet.fields": "created_at,public_metrics,author_id",
            "user.fields": "username,name",
            "expansions": "author_id"
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/tweets/search/recent",
                    headers=self.headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._format_response(data)
                elif response.status_code == 429:
                    logger.error("Twitter API rate limit exceeded")
                    return {"error": "Rate limit exceeded", "tweets": []}
                else:
                    logger.error(f"Twitter API error: {response.status_code} - {response.text}")
                    return {"error": f"API error: {response.status_code}", "tweets": []}
        
        except Exception as e:
            logger.error(f"Error searching tweets: {str(e)}")
            return {"error": str(e), "tweets": []}
    
    def _format_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format Twitter API response"""
        tweets = data.get('data', [])
        users = {u['id']: u for u in data.get('includes', {}).get('users', [])}
        
        formatted_tweets = []
        for tweet in tweets:
            user = users.get(tweet['author_id'], {})
            formatted_tweets.append({
                'tweet_id': tweet['id'],
                'text': tweet['text'],
                'username': user.get('username', 'unknown'),
                'name': user.get('name', 'Unknown User'),
                'created_at': tweet['created_at'],
                'engagement_metrics': tweet.get('public_metrics', {}),
                'raw_json': tweet
            })
        
        return {
            'tweets': formatted_tweets,
            'count': len(formatted_tweets),
            'meta': data.get('meta', {})
        }