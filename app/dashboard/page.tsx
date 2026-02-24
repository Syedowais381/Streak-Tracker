'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  Check,
  CirclePlus,
  Flame,
  ListChecks,
  LogOut,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import Toast from '../components/Toast';

interface Streak {
  id: string;
  habit: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  user_id: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
        await ensureProfileExists(session.user);
        fetchStreaks(session.user.id);
      }
    };

    checkSession();
  }, [router]);

  const ensureProfileExists = async (user: User) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        const username = user.user_metadata?.username || 'User';
        const age = user.user_metadata?.age ? parseInt(user.user_metadata.age) : 25;

        const { error: insertError } = await supabase.from('user_profiles').insert([
          {
            user_id: user.id,
            username,
            age,
          },
        ]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (err) {
      console.error('Unexpected error ensuring profile:', err);
    }
  };

  const fetchStreaks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching streaks:', error);
        setToast({
          message: 'Failed to load your habits. Please refresh and try again.',
          type: 'error',
          isVisible: true,
        });
        return;
      }

      if (data) {
        setStreaks(data);
        const totalCurrent = data.reduce((sum, streak) => sum + (streak.current_streak || 0), 0);
        const totalLongest = data.reduce((sum, streak) => sum + (streak.longest_streak || 0), 0);
        setCurrentStreak(totalCurrent);
        setLongestStreak(totalLongest);
        setTotalActive(data.length);
      }
    } catch (err) {
      console.error('Unexpected error fetching streaks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setToast({
        message:
          errorMessage.includes('fetch') || errorMessage.includes('network')
            ? 'Network error. Please check your connection and try again.'
            : 'Failed to load your habits. Please refresh and try again.',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newHabit.trim()) {
      setToast({
        message: 'Please enter a habit name.',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setToast({
          message: 'Session expired. Please log in again.',
          type: 'error',
          isVisible: true,
        });
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('streaks').insert([{ user_id: session.user.id, habit: newHabit.trim() }]);

      if (!error) {
        const habitName = newHabit.trim();
        setNewHabit('');
        setIsAddModalOpen(false);
        setToast({
          message: `Habit "${habitName}" added successfully.`,
          type: 'success',
          isVisible: true,
        });
        await fetchStreaks(session.user.id);
      } else {
        const errorMessage =
          error.message.includes('network') || error.message.includes('fetch')
            ? 'Network error. Please check your connection and try again.'
            : error.message;
        setToast({
          message: `Error: ${errorMessage}`,
          type: 'error',
          isVisible: true,
        });
      }
    } catch (err) {
      console.error('Error adding habit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setToast({
        message:
          errorMessage.includes('fetch') || errorMessage.includes('network')
            ? 'Network error. Please check your connection and try again.'
            : 'Failed to add habit. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (habitId: string) => {
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setToast({
          message: 'Session expired. Please log in again.',
          type: 'error',
          isVisible: true,
        });
        router.push('/login');
        return;
      }

      const habit = streaks.find((s) => s.id === habitId);
      if (!habit) {
        setToast({
          message: 'Habit not found. Please refresh the page.',
          type: 'error',
          isVisible: true,
        });
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastCheck = habit.last_check_in ? new Date(habit.last_check_in).toISOString().split('T')[0] : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCheck === today) {
        setCheckInMessage('Already checked in today. Great consistency.');
        setIsCheckInModalOpen(true);
        return;
      }

      let newCurrent = habit.current_streak || 0;
      if (lastCheck && lastCheck !== yesterdayStr && lastCheck !== today) {
        newCurrent = 1;
      } else {
        newCurrent = (newCurrent || 0) + 1;
      }

      const newLongest = Math.max(habit.longest_streak || 0, newCurrent);

      const { error } = await supabase
        .from('streaks')
        .update({
          current_streak: newCurrent,
          longest_streak: newLongest,
          last_check_in: new Date().toISOString(),
        })
        .eq('id', habitId);

      if (!error) {
        setCheckInMessage(`Excellent work. Your streak is now ${newCurrent} days.`);
        setIsCheckInModalOpen(true);
        await fetchStreaks(session.user.id);
      } else {
        const errorMessage =
          error.message.includes('network') || error.message.includes('fetch')
            ? 'Network error. Please check your connection and try again.'
            : error.message;
        setToast({
          message: `Error: ${errorMessage}`,
          type: 'error',
          isVisible: true,
        });
      }
    } catch (err) {
      console.error('Error checking in:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setToast({
        message:
          errorMessage.includes('fetch') || errorMessage.includes('network')
            ? 'Network error. Please check your connection and try again.'
            : 'Failed to check in. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const streakHealth = useMemo(() => {
    if (totalActive === 0) return 0;
    return Math.min(Math.round((currentStreak / Math.max(longestStreak || 1, totalActive * 7)) * 100), 100);
  }, [currentStreak, longestStreak, totalActive]);

  const getStreakBadge = (days: number) => {
    if (days >= 100) return 'Legend';
    if (days >= 50) return 'Elite';
    if (days >= 30) return 'Advanced';
    if (days >= 7) return 'Building';
    return 'Starting';
  };

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="surface p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <p className="text-body mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="app-container flex h-16 items-center justify-between">
          <Link href="/" className="brand">
            Streak Tracker
          </Link>
          <button className="btn btn-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="section">
        <div className="app-container space-y-6">
          <section className="surface-strong p-5 sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Dashboard</p>
                <h1 className="mt-2">Build consistency every day.</h1>
                <p className="text-body mt-2 max-w-2xl">
                  Track active habits, protect current streaks, and keep momentum visible.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <CirclePlus className="h-4 w-4" />
                Add Habit
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="metric cursor-pointer" onClick={() => setIsHabitsModalOpen(true)}>
              <div className="flex items-center justify-between">
                <h4>Current Streak</h4>
                <Flame className="h-5 w-5 text-orange-300" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-100">{currentStreak}</p>
              <p className="text-caption mt-1">Total streak days across habits</p>
            </article>

            <article className="metric">
              <div className="flex items-center justify-between">
                <h4>Longest Streak</h4>
                <Trophy className="h-5 w-5 text-amber-300" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-100">{longestStreak}</p>
              <p className="text-caption mt-1">Personal best</p>
            </article>

            <article className="metric cursor-pointer" onClick={() => setIsHabitsModalOpen(true)}>
              <div className="flex items-center justify-between">
                <h4>Active Habits</h4>
                <ListChecks className="h-5 w-5 text-blue-300" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-100">{totalActive}</p>
              <p className="text-caption mt-1">Currently tracked</p>
            </article>

            <article className="metric">
              <div className="flex items-center justify-between">
                <h4>Streak Health</h4>
                <Target className="h-5 w-5 text-emerald-300" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-100">{streakHealth}%</p>
              <div className="progress-track mt-3">
                <div className="progress-fill" style={{ width: `${streakHealth}%` }} />
              </div>
            </article>
          </section>

          <section>
            {streaks.length === 0 ? (
              <div className="surface p-8 text-center sm:p-10">
                <Sparkles className="mx-auto h-8 w-8 text-blue-300" />
                <h3 className="mt-4">No habits yet</h3>
                <p className="text-body mt-2">Start with one habit and check in daily to build your first streak.</p>
                <button className="btn btn-primary mt-5" onClick={() => setIsAddModalOpen(true)}>
                  Add Your First Habit
                </button>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {streaks.map((streak) => {
                  const progress =
                    streak.longest_streak > 0
                      ? Math.min((streak.current_streak / Math.max(streak.longest_streak, 30)) * 100, 100)
                      : 0;

                  const isCheckedToday = streak.last_check_in
                    ? new Date(streak.last_check_in).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                    : false;

                  return (
                    <article key={streak.id} className="surface p-5 sm:p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3>{streak.habit}</h3>
                          <p className="text-caption mt-2">Status: {getStreakBadge(streak.current_streak || 0)}</p>
                        </div>
                        <div className="rounded-full border border-slate-600 bg-slate-700/30 px-3 py-1 text-xs font-semibold text-slate-200">
                          {streak.current_streak || 0} days
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
                          <p className="text-caption">Current</p>
                          <p className="mt-1 text-xl font-semibold text-slate-100">{streak.current_streak || 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800/35 p-3">
                          <p className="text-caption">Best</p>
                          <p className="mt-1 text-xl font-semibold text-slate-100">{streak.longest_streak || 0}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-caption">Progress to your best</p>
                          <p className="text-caption">{Math.round(progress)}%</p>
                        </div>
                        <div className="progress-track mt-2">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckIn(streak.id)}
                        disabled={isSubmitting || isCheckedToday}
                        className={`btn mt-5 w-full ${isCheckedToday ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {isSubmitting ? (
                          <>Processing...</>
                        ) : isCheckedToday ? (
                          <>
                            <Check className="h-4 w-4" />
                            Checked In Today
                          </>
                        ) : (
                          <>
                            <Flame className="h-4 w-4" />
                            Check In
                          </>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {isAddModalOpen && (
        <>
          <div className="modal-overlay fade-in" onClick={() => setIsAddModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-panel pop-in w-full max-w-md p-6 sm:p-7">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="eyebrow">New Habit</p>
                  <h3 className="mt-2">Add a habit to track</h3>
                </div>
                <button className="btn btn-ghost h-8 w-8 p-0" onClick={() => setIsAddModalOpen(false)} aria-label="Close modal">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                  <label className="field-label">Habit name</label>
                  <input
                    type="text"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    className="input"
                    placeholder="e.g. Morning reading"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                  {isSubmitting ? 'Adding...' : 'Add Habit'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {isHabitsModalOpen && (
        <>
          <div className="modal-overlay fade-in" onClick={() => setIsHabitsModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-panel pop-in max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-7">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="eyebrow">Overview</p>
                  <h3 className="mt-2">Your active habits</h3>
                </div>
                <button className="btn btn-ghost h-8 w-8 p-0" onClick={() => setIsHabitsModalOpen(false)} aria-label="Close modal">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {streaks.map((streak) => (
                  <article key={streak.id} className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5>{streak.habit}</h5>
                      <p className="text-caption mt-1">
                        Current: {streak.current_streak || 0} days | Best: {streak.longest_streak || 0} days
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsHabitsModalOpen(false);
                        handleCheckIn(streak.id);
                      }}
                      disabled={isSubmitting}
                    >
                      Check In
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isCheckInModalOpen && (
        <>
          <div
            className="modal-overlay fade-in"
            onClick={() => {
              setIsCheckInModalOpen(false);
              setCheckInMessage('');
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-panel pop-in w-full max-w-md p-6 text-center sm:p-7">
              <h3>{checkInMessage.includes('Already') ? 'Already Completed' : 'Check-in Recorded'}</h3>
              <p className="text-body mt-3">{checkInMessage || 'Check-in successful.'}</p>
              <button
                className="btn btn-primary mt-6"
                onClick={() => {
                  setIsCheckInModalOpen(false);
                  setCheckInMessage('');
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </>
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

