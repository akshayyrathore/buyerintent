import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import IntentBadge from '../components/IntentBadge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Datasets = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get(`${API}/datasets`);
      setDatasets(response.data.datasets);
    } catch (error) {
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  const exportDatasets = () => {
    const jsonString = JSON.stringify(datasets, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buyer-intent-datasets-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Dataset exported!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              data-testid="back-button"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold">Intent Datasets</h1>
            <p className="text-muted-foreground mt-2">
              Training data for model improvements and analytics
            </p>
          </div>

          {datasets.length > 0 && (
            <button
              onClick={exportDatasets}
              data-testid="export-button"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No datasets yet. Run searches to generate training data!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {datasets.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                data-testid={`dataset-item-${item.id}`}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <IntentBadge label={item.intent_label} />
                      <span className="text-sm text-muted-foreground">
                        Score: {Math.round(item.intent_score * 100)}%
                      </span>
                      <span className="text-sm text-muted-foreground">@{item.username}</span>
                    </div>
                    
                    <p className="text-foreground mb-3">{item.text}</p>
                    
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-xs text-muted-foreground mb-1">Reasoning</div>
                      <p className="text-sm text-muted-foreground italic">"{item.reasoning}"</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
                  <span>Tweet ID: {item.tweet_id}</span>
                  <span>
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Datasets;