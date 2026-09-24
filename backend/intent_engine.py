from groq import Groq
import os
import json
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class IntentEngine:
    def __init__(self):
        self.client = Groq(api_key=os.environ['GROQ_API_KEY'])
        self.model = "llama-3.3-70b-versatile"
    
    async def expand_search_intent(
        self,
        location: str,
        category: str,
        keywords: List[str]
    ) -> Dict[str, Any]:
        """Use LLM to expand search intent into optimized terms"""
        prompt = f"""You are a semantic search expert. Given a buyer intent search, expand it into optimal Twitter search terms.

Input:
- Location: {location}
- Category: {category}
- Keywords: {', '.join(keywords)}

Generate:
1. location_terms: 5-8 location variations (city name, abbreviations, landmarks, local language)
2. category_terms: 8-12 domain-specific keywords related to the category
3. intent_terms: 6-10 phrases indicating buying intent

Output ONLY valid JSON in this exact format:
{{
  "location_terms": ["term1", "term2", ...],
  "category_terms": ["term1", "term2", ...],
  "intent_terms": ["looking for", "need", "recommend", ...]
}}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            # Extract JSON from response
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            result = json.loads(content)
            return result
        
        except Exception as e:
            logger.error(f"Error expanding search intent: {str(e)}")
            # Fallback to basic expansion
            return {
                "location_terms": [location],
                "category_terms": keywords,
                "intent_terms": ["looking for", "need", "recommend", "best", "any"]
            }
    
    async def analyze_tweet_intent(
        self,
        tweet_text: str,
        location: str,
        category: str
    ) -> Dict[str, Any]:
        """Analyze a tweet for buyer intent, location relevance, and category match"""
        prompt = f"""Analyze this tweet for buyer intent signals.

Tweet: "{tweet_text}"

Target:
- Location: {location}
- Category: {category}

Analyze and output ONLY valid JSON:
{{
  "intent_score": 0.0-1.0,
  "intent_label": "high" | "medium" | "low",
  "location_confidence": 0.0-1.0,
  "category_match": true | false,
  "reasoning": "brief explanation"
}}

Intent score criteria:
- 0.8-1.0 (high): Clear buying intent with urgency
- 0.5-0.79 (medium): Exploring options, asking for recommendations
- 0.0-0.49 (low): Casual mention, no clear intent"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=300
            )
            
            content = response.choices[0].message.content.strip()
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            result = json.loads(content)
            return result
        
        except Exception as e:
            logger.error(f"Error analyzing tweet intent: {str(e)}")
            return {
                "intent_score": 0.0,
                "intent_label": "low",
                "location_confidence": 0.0,
                "category_match": False,
                "reasoning": f"Error: {str(e)}"
            }