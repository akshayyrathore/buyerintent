import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Tag, Plus, X, Twitter, LogOut, History, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import TweetCard from '../components/TweetCard';
import IntentBadge from '../components/IntentBadge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    category: '',
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!formData.location || !formData.category || formData.keywords.length === 0) {
      toast.error('Please fill all fields');
      return;
    }

    setSearching(true);
    try {
      const response = await axios.post(`${API}/search/twitter`, formData);
      setResults(response.data);
      toast.success(`Found ${response.data.count} high-intent tweets!`);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.detail || 'Search failed';
      
      if (status === 429) {
        // Rate limit error
        toast.error(
          'Twitter API Rate Limit Reached! You have 100 requests/month on Basic tier. Try again after monthly reset.',
          { duration: 8000 }
        );
      } else {
        toast.error(message);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-white/5 glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Twitter className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-heading font-bold">BuyerIntent</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/history')}
              data-testid="nav-history-button"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={() => navigate('/datasets')}
              data-testid="nav-datasets-button"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Datasets</span>
            </button>
            <button
              onClick={handleLogout}
              data-testid="nav-logout-button"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-12"
        >
          <h1 className="text-3xl font-bold mb-2">Find Buyer Intent</h1>
          <p className="text-muted-foreground mb-8">Search Twitter for people actively looking to buy</p>

          {/* Rate Limit Warning */}
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-500 mb-1">Twitter API Rate Limit</div>
              <div className="text-sm text-muted-foreground">
                You have 100 requests/month on Basic tier. Use searches wisely. If limit is reached, wait for monthly reset.
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="location">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="location"
                  type="text"
                  required
                  data-testid="search-location-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                  placeholder="e.g., Hyderabad, San Francisco, Mumbai"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="category">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="category"
                  type="text"
                  required
                  data-testid="search-category-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                  placeholder="e.g., SaaS, Marketing, D2C, Real Estate"
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Keywords
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  data-testid="search-keyword-input"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-4 py-3 bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                  placeholder="e.g., CRM, tool, automation"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  data-testid="add-keyword-button"
                  className="px-4 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-colors"
                >
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      data-testid={`remove-keyword-${keyword}`}
                      className="hover:text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={searching}
              data-testid="search-submit-button"
              className="w-full py-4 rounded-full bg-primary text-primary-foreground text-lg font-medium transition-all duration-300 glow hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.7)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Analyzing Tweets...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Twitter
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{results.count}</div>
                  <div className="text-sm text-muted-foreground">High-Intent Tweets</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{results.datasets_created}</div>
                  <div className="text-sm text-muted-foreground">Datasets Generated</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {results.tweets.filter(t => t.intent_label === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority Leads</div>
                </div>
              </div>

              {/* Search Query Info */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Twitter Query Used</h3>
                <code className="text-sm font-mono text-primary break-all">{results.search_query}</code>
              </div>

              {/* Tweets */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Results ({results.count})</h2>
                {results.tweets.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-muted-foreground">No high-intent tweets found. Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.tweets.map((tweet, i) => (
                      <TweetCard key={i} tweet={tweet} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;