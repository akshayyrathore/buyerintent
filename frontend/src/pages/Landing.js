import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Brain, Zap, Twitter, Target, Database, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intent Detection",
      description: "Llama 3.2 analyzes tweets to identify genuine buyer intent with precision."
    },
    {
      icon: Target,
      title: "Location & Category Filtering",
      description: "Target specific markets with semantic location and category matching."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Buyer Signals",
      description: "Catch buying conversations as they happen on Twitter."
    },
    {
      icon: Database,
      title: "Training Dataset Generation",
      description: "Automatically build datasets for ML model improvements."
    }
  ];

  if (showAuth) {
    navigate('/auth');
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero glow effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 50%)'
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Twitter className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-heading font-bold">BuyerIntent</span>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAuth(true)}
            data-testid="nav-login-button"
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300 glow"
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Llama 3.2 + Twitter API v2</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Turn Twitter Into Your
            <br />
            <span className="text-gradient">Buyer Signal Engine</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
            Find people actively looking to buy in your category. 
            AI-powered intent detection converts public conversations into structured demand signals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAuth(true)}
              data-testid="hero-get-started-button"
              className="w-full sm:w-auto px-8 py-6 rounded-full bg-primary text-primary-foreground text-lg font-medium transition-all duration-300 glow hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.7)]"
            >
              Start Finding Buyers
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-6 py-6 rounded-full bg-secondary text-secondary-foreground text-lg font-medium border border-white/5 hover:bg-secondary/80 transition-all"
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { label: "Intent Accuracy", value: "94%" },
            { label: "Avg Response Time", value: "<2s" },
            { label: "Signals Detected", value: "10K+" }
          ].map((stat, i) => (
            <div key={i} className="text-center glass rounded-3xl p-6">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Precision Over Recall
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for YC-grade startups that need actionable buyer signals, not noise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/5 to-transparent p-8 border border-white/10 hover:border-primary/50 transition-all duration-500"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-medium mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
                
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 card-shimmer" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 md:p-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Find Your Next Customer?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join early-stage founders using AI to turn Twitter into their top demand generation channel.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAuth(true)}
            data-testid="cta-get-started-button"
            className="px-8 py-6 rounded-full bg-primary text-primary-foreground text-lg font-medium transition-all duration-300 glow hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.7)]"
          >
            Start Free Today
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Twitter className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading font-bold">BuyerIntent</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 BuyerIntent. Built for startups, by startups.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;