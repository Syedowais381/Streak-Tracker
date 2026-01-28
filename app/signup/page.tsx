'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

    // Validation
    if (!username.trim()) {
      setToast({
        message: 'Please enter a username',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    // Username validation: alphanumeric and underscore only, 3-20 characters
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setToast({
        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    // Check if username is already taken
    try {
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username.trim())
        .single();

      if (existingUser) {
        setToast({
          message: 'Username already taken. Please choose a different one.',
          type: 'error',
          isVisible: true,
        });
        return;
      }
    } catch (err: any) {
      // PGRST116 is "no rows found" which is what we want
      if (err.code !== 'PGRST116') {
        console.error('Error checking username:', err);
      }
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      setToast({
        message: 'Please enter a valid age (1-150)',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    if (password.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters long',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      setToast({
        message: 'Passwords do not match',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use environment variable for production URL, fallback to current origin
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        : `${window.location.origin}/dashboard`;

      // Sign up the user with Supabase Auth
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

      // Enhanced error logging
      if (authError) {
        console.error('Supabase signup error:', {
          message: authError.message,
          status: authError.status,
          error: authError,
        });
        setToast({
          message: authError.message,
          type: 'error',
          isVisible: true,
        });
        return;
      }

      // Log signup response for debugging
      console.log('Signup response:', {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email,
          email_confirmed_at: authData.user.email_confirmed_at,
        } : null,
        session: authData.session,
      });

      // Check if user was created but email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log('User created but email not confirmed. Email should be sent.');
      }

      // If signup was successful and we have a user, create the profile
      // Note: If email confirmation is required, session might be null, so we'll try to create profile
      // If it fails due to RLS, the profile will be created after email confirmation
      if (authData.user) {
        // Only try to create profile if we have a session (user is immediately authenticated)
        // Otherwise, profile creation will happen after email confirmation
        if (authData.session) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                user_id: authData.user.id,
                username: username.trim(),
                age: ageNum,
              },
            ]);

          if (profileError) {
            console.error('Error creating user profile:', {
              error: profileError,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              code: profileError.code,
            });
            
            // Show warning but don't fail signup
            setToast({
              message: 'Account created! Profile setup had an issue. You can update it later.',
              type: 'info',
              isVisible: true,
            });
          } else {
            console.log('User profile created successfully');
          }
        } else {
          // No session yet (email confirmation required)
          // Profile will be created after email confirmation via database trigger or on first login
          console.log('User created but session not active (email confirmation required). Profile will be created after confirmation.');
        }
      }

      // Show success message
      const successMessage = authData.user?.email_confirmed_at
        ? 'Account created successfully! You can now login. 🎉'
        : 'Check your email for the confirmation link! 📧';
      
      setToast({
        message: successMessage,
        type: 'success',
        isVisible: true,
      });

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-primary">
      {/* Background */}
      <div className="fixed inset-0 bg-dot-pattern" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-glow-blob animate-pulse-glow" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-glow-blob opacity-20 animate-pulse-glow anim-delay-1000" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <a
            href="/"
            className="text-green-100 font-extrabold tracking-tight uppercase text-lg md:text-xl text-shadow-glow-sm whitespace-nowrap"
          >
            Streak Tracker
          </a>
          <div className="ml-auto flex items-center gap-5 md:gap-8">
            <button
              onClick={() => router.push('/')}
              className="nav-link text-sm font-semibold whitespace-nowrap"
            >
              Home
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary text-white font-bold py-2.5 px-5 rounded-xl shadow-lg text-sm md:text-base whitespace-nowrap shrink-0"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-screen p-4 pt-20 sm:pt-24 relative z-10">
        <div className="glass-card p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-5xl">✨</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 uppercase text-gradient-secondary">
              Create Account
            </h2>
            <p className="text-green-300 text-sm">Start your streak journey</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-green-200/90 mb-2 text-sm font-semibold">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/60"
                placeholder="streak_master"
                maxLength={20}
                required
              />
              {username.length > 0 && !/^[a-zA-Z0-9_]*$/.test(username) && (
                <p className="text-red-400 text-xs mt-1">Only letters, numbers, and underscores allowed</p>
              )}
              {username.length > 0 && (username.length < 3 || username.length > 20) && (
                <p className="text-red-400 text-xs mt-1">Username must be 3-20 characters</p>
              )}
            </div>

            <div>
              <label className="block text-green-200/90 mb-2 text-sm font-semibold">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/60"
                placeholder="25"
                min="1"
                max="150"
                required
              />
            </div>

            <div>
              <label className="block text-green-200/90 mb-2 text-sm font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/60"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-green-200/90 mb-2 text-sm font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/60"
                placeholder="•••••••• (min. 6 characters)"
                required
                minLength={6}
              />
              {password.length > 0 && password.length < 6 && (
                <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            <div>
              <label className="block text-green-200/90 mb-2 text-sm font-semibold">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/60"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
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
              onClick={() => router.push('/login')}
              className="text-green-300 hover:text-green-200 text-sm transition-colors"
            >
              Already have an account? <span className="font-semibold underline">Login</span>
            </button>
          </div>
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
