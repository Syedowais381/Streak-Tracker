'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn } from 'lucide-react';

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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setToast({ message: error.message, type: 'error', isVisible: true });
      } else {
        setToast({ message: 'Login successful. Redirecting...', type: 'success', isVisible: true });
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setToast({
        message:
          errorMessage.includes('fetch') || errorMessage.includes('network')
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
    <div className="app-shell">
      <header className="topbar">
        <div className="app-container flex h-16 items-center justify-between">
          <Link href="/" className="brand">
            Streak Tracker
          </Link>
          <button className="btn btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>
        </div>
      </header>

      <main className="section flex min-h-[calc(100vh-64px)] items-center">
        <div className="app-container">
          <div className="mx-auto w-full max-w-md surface-strong p-6 sm:p-8">
            <div className="mb-6">
              <p className="eyebrow">Welcome Back</p>
              <h1 className="mt-2 text-3xl">Log in to your account</h1>
              <p className="text-body mt-2">Resume your habits and continue your streak.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="field-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                <LogIn className="h-4 w-4" />
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <p className="text-caption mt-6 text-center">
              Need an account?{' '}
              <button className="text-blue-300 hover:text-blue-200 transition-colors" onClick={() => router.push('/signup')}>
                Create one
              </button>
            </p>
          </div>
        </div>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

