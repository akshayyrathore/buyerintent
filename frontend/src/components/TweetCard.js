import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Heart, MessageCircle, Repeat2, ExternalLink } from 'lucide-react';
import IntentBadge from './IntentBadge';

const TweetCard = ({ tweet }) => {
  const { 
    tweet_id, 
    text, 
    username, 
    name,
    created_at, 
    engagement_metrics,
    intent_score,
    intent_label,
    location_confidence,
    reasoning
  } = tweet;

  const tweetUrl = `https://twitter.com/${username}/status/${tweet_id}`;
  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      data-testid={`tweet-card-${tweet_id}`}
      className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Twitter className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold truncate">{name}</span>
              <span className="text-muted-foreground text-sm truncate">@{username}</span>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">{formattedDate}</span>
            </div>
          </div>
        </div>
        
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`tweet-link-${tweet_id}`}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>

      {/* Tweet Text */}
      <p className="text-foreground leading-relaxed mb-4">{text}</p>

      {/* Intent Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 rounded-xl bg-black/20">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Intent Score</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${intent_score * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(intent_score * 100)}%</span>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-muted-foreground mb-1">Priority</div>
          <IntentBadge label={intent_label} />
        </div>
        
        <div>
          <div className="text-xs text-muted-foreground mb-1">Location Match</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${location_confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(location_confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-4 p-3 rounded-lg bg-white/5">
        <div className="text-xs text-muted-foreground mb-1">AI Analysis</div>
        <p className="text-sm text-muted-foreground italic">"{reasoning}"</p>
      </div>

      {/* Engagement Metrics */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          <span>{engagement_metrics?.like_count || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>{engagement_metrics?.reply_count || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Repeat2 className="w-4 h-4" />
          <span>{engagement_metrics?.retweet_count || 0}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TweetCard;