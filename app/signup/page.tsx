'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import Toast from '../components/Toast';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setToast({ message: 'Please enter a username.', type: 'error', isVisible: true });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setToast({
        message: 'Username must be 3-20 characters and include only letters, numbers, or underscores.',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    try {
      const { data: existingUser } = await supabase.from('user_profiles').select('id').eq('username', username.trim()).single();

      if (existingUser) {
        setToast({ message: 'Username already taken. Please choose another one.', type: 'error', isVisible: true });
        return;
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const code = (err as { code?: string }).code;
        if (code !== 'PGRST116') {
          console.error('Error checking username:', err);
        }
      }
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      setToast({ message: 'Please enter a valid age (1-150).', type: 'error', isVisible: true });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters.', type: 'error', isVisible: true });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match.', type: 'error', isVisible: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        : `${window.location.origin}/dashboard`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username.trim(),
            age: ageNum,
          },
        },
      });

      if (authError) {
        console.error('Supabase signup error:', authError);
        setToast({ message: authError.message, type: 'error', isVisible: true });
        return;
      }

      if (authData.user && authData.session) {
        const { error: profileError } = await supabase.from('user_profiles').insert([
          {
            user_id: authData.user.id,
            username: username.trim(),
            age: ageNum,
          },
        ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          setToast({
            message: 'Account created. Profile setup had an issue and can be completed later.',
            type: 'info',
            isVisible: true,
          });
        }
      }

      const successMessage = authData.user?.email_confirmed_at
        ? 'Account created successfully. You can now log in.'
        : 'Check your email for the confirmation link.';

      setToast({ message: successMessage, type: 'success', isVisible: true });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
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
              <p className="eyebrow">Create Account</p>
              <h1 className="mt-2 text-3xl">Start your streak system</h1>
              <p className="text-body mt-2">Set up your account and begin tracking your progress.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="field-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="streak_master"
                  maxLength={20}
                  required
                />
                {username.length > 0 && !/^[a-zA-Z0-9_]*$/.test(username) && (
                  <p className="text-caption mt-1 text-danger">Only letters, numbers, and underscores are allowed.</p>
                )}
              </div>

              <div>
                <label className="field-label">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input"
                  placeholder="25"
                  min="1"
                  max="150"
                  required
                />
              </div>

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
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="field-label">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-caption mt-1 text-danger">Passwords do not match.</p>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-caption mt-6 text-center">
              Already have an account?{' '}
              <button className="text-blue-300 hover:text-blue-200 transition-colors" onClick={() => router.push('/login')}>
                Log in
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

