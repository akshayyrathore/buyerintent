import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      const { token, email, user_id } = response.data;
      login(token, email, user_id);
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Twitter className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-heading font-bold">BuyerIntent</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? 'Sign in to your account' : 'Create your account to start finding buyers'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  data-testid="auth-email-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl text-lg backdrop-blur-sm outline-none focus:ring-2 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  data-testid="auth-password-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl text-lg backdrop-blur-sm outline-none focus:ring-2 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              data-testid="auth-submit-button"
              className="w-full py-4 rounded-full bg-primary text-primary-foreground text-lg font-medium transition-all duration-300 glow hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.7)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              data-testid="auth-toggle-button"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-primary font-medium">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20" />
        <img
          src="https://images.unsplash.com/photo-1768327239495-cd6edaeab619?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Abstract visualization"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 glass rounded-3xl p-12 max-w-md"
        >
          <h2 className="text-3xl font-bold mb-4">
            Find Buyers Before
            <br />
            <span className="text-gradient">Your Competitors Do</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Turn public Twitter conversations into your private demand signal engine. 
            AI-powered, precise, and built for speed.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;