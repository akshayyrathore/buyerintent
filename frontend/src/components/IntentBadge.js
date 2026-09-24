import React from 'react';
import { AlertCircle, Zap, TrendingUp } from 'lucide-react';

const IntentBadge = ({ label }) => {
  const config = {
    high: {
      icon: Zap,
      text: 'High',
      className: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    medium: {
      icon: TrendingUp,
      text: 'Medium',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    low: {
      icon: AlertCircle,
      text: 'Low',
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  };

  const { icon: Icon, text, className } = config[label] || config.low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
};

export default IntentBadge;