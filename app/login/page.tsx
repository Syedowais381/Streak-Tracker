'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Toast from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setToast({
          message: error.message,
          type: 'error',
          isVisible: true,
        });
      } else {
        setToast({
          message: 'Login successful! Redirecting... 🚀',
          type: 'success',
          isVisible: true,
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
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
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-glow-blob opacity-20 animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-glow-blob opacity-25 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="text-5xl">🔥</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 uppercase text-gradient-secondary">
            Welcome Back
          </h2>
          <p className="text-green-300 text-sm">Continue your streak journey</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
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
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Logging in...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                <span>Login</span>
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-green-400 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/')}
              className="text-green-300 hover:text-green-200 font-semibold underline transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}