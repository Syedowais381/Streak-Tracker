'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Toast from './components/Toast';

const quotes = [
  "\"The only way to do great work is to love what you do.\" - Steve Jobs",
  "\"Success is not final, failure is not fatal: It is the courage to continue that counts.\" - Winston Churchill",
  "\"Your only limit is you.\" - Unknown",
  "\"Discipline is the bridge between goals and accomplishment.\" - Jim Rohn",
  "\"The journey of a thousand miles begins with one step.\" - Lao Tzu",
  "\"Strength does not come from physical capacity. It comes from an indomitable will.\" - Mahatma Gandhi",
  "\"Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.\" - Unknown",
  "\"Every accomplishment starts with the decision to try.\" - John F. Kennedy",
  "\"You are stronger than you think.\" - Unknown",
  "\"Progress, not perfection.\" - Unknown"
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [randomQuote, setRandomQuote] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setIsLoaded(true);

    // Check if user is already logged in and redirect to dashboard
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.push('/dashboard');
        }
      } catch (err) {
        // Silently handle auth check errors
        console.error('Auth check error:', err);
      }
    };
    checkUser();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (password.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters long',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setToast({
          message: error.message,
          type: 'error',
          isVisible: true,
        });
      } else {
        setToast({
          message: 'Check your email for the confirmation link! 📧',
          type: 'success',
          isVisible: true,
        });
        setIsModalOpen(false);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setToast({
        message: errorMessage.includes('fetch') || errorMessage.includes('network') 
          ? 'Network error. Please check your connection and try again.'
          : 'An unexpected error occurred. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-primary">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-dot-pattern"></div>
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-glow-blob animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-glow-blob opacity-20 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gradient-primary mb-6 md:mb-8 uppercase tracking-tighter leading-tight">
            Streak Tracker
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-8"></div>
        </div>
        
        <blockquote className={`text-xl md:text-2xl lg:text-3xl italic text-green-200 mb-10 md:mb-14 leading-relaxed max-w-3xl mx-auto ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          <span className="text-green-400 text-3xl md:text-4xl mr-3">"</span>
          {randomQuote}
          <span className="text-green-400 text-3xl md:text-4xl ml-3">"</span>
        </blockquote>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary text-white font-bold py-4 px-10 rounded-xl text-lg md:text-xl shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>Login</span>
            </span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-secondary text-white font-bold py-4 px-10 rounded-xl text-lg md:text-xl shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Sign Up</span>
            </span>
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-green-300 text-sm md:text-base animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <span className="text-green-400">🔥</span>
          <p>Join <span className="font-bold text-green-200">1,000+</span> builders on their journey</p>
          <span className="text-green-400">🔥</span>
        </div>
      </div>

      {isModalOpen && (
        <Fragment>
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 modal-overlay"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full relative modal-content">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-green-400 hover:text-green-300 text-3xl font-bold z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-900/50 transition-all"
                aria-label="Close modal"
              >
                ×
              </button>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase text-gradient-secondary">
                    Create Account
                  </h2>
                  <p className="text-green-300 text-sm">Start your journey today</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-5">
                  <div>
                    <label className="block text-green-300 mb-2 text-sm font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-green-300 mb-2 text-sm font-medium">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/50"
                      placeholder="•••••••• (min. 6 characters)"
                      required
                      minLength={6}
                    />
                    {password.length > 0 && password.length < 6 && (
                      <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>✨</span>
                        <span>Sign Up</span>
                      </span>
                    )}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-green-400 hover:text-green-300 text-sm transition-colors"
                  >
                    Already have an account? <span className="font-semibold">Login</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
