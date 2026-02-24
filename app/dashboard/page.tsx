'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Check, CirclePlus, Flame, LogOut, RotateCcw, Target, Trash2, TrendingUp, Trophy, X } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import Toast from '../components/Toast';

interface Streak {
  id: string;
  habit: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  user_id: string;
  created_at?: string;
}

interface UserProfile {
  user_id: string;
  username: string;
}

type DayCell = {
  key: string;
  label: string;
  intensity: number;
  hasActivity: boolean;
};

const toDateOnly = (value: string | null) => {
  if (!value) return null;
  return new Date(value).toISOString().split('T')[0];
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const isCheckedToday = (lastCheckIn: string | null) => toDateOnly(lastCheckIn) === getTodayDate();

const isStreakBroken = (lastCheckIn: string | null) => {
  const lastCheck = toDateOnly(lastCheckIn);
  if (!lastCheck) return false;
  return lastCheck !== getTodayDate() && lastCheck !== getYesterdayDate();
};

const getRelativeGrowthTone = (days: number) => {
  if (days >= 60) return 'Steady mastery';
  if (days >= 21) return 'Strong rhythm';
  if (days >= 7) return 'Momentum building';
  return 'Foundation phase';
};

const getWeeklyCells = (streaks: Streak[]): DayCell[] => {
  const days = 7;
  const activityByDay: Record<string, number> = {};

  streaks.forEach((streak) => {
    if (!streak.last_check_in || !streak.current_streak) return;
    const lastDate = new Date(streak.last_check_in);
    const span = Math.min(streak.current_streak, 30);

    for (let i = 0; i < span; i += 1) {
      const day = new Date(lastDate);
      day.setDate(day.getDate() - i);
      const key = day.toISOString().split('T')[0];
      activityByDay[key] = (activityByDay[key] || 0) + 1;
    }
  });

  const cells: DayCell[] = [];
  const totalHabits = Math.max(streaks.length, 1);

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = day.toISOString().split('T')[0];
    const count = activityByDay[key] || 0;
    const ratio = Math.min(count / totalHabits, 1);

    cells.push({
      key,
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      intensity: ratio,
      hasActivity: count > 0,
    });
  }

  return cells;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [username, setUsername] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Streak | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedHabitId, setHighlightedHabitId] = useState<string | null>(null);
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
        return;
      }

      await ensureProfileExists(session.user);
      await Promise.all([fetchStreaks(session.user.id), fetchProfile(session.user.id)]);
      setLoading(false);
    };

    void checkSession();
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
        const fallbackName = user.email?.split('@')[0] || 'User';
        const usernameValue = user.user_metadata?.username || fallbackName;
        const age = user.user_metadata?.age ? parseInt(user.user_metadata.age, 10) : 25;

        const { error: insertError } = await supabase.from('user_profiles').insert([
          {
            user_id: user.id,
            username: usernameValue,
            age,
          },
        ]);

        if (insertError) console.error('Error creating profile:', insertError);
      }
    } catch (err) {
      console.error('Unexpected error ensuring profile:', err);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('user_id, username').eq('user_id', userId).single();
      if (error) {
        if (error.code !== 'PGRST116') console.error('Error fetching profile:', error);
        return;
      }
      const profile = data as UserProfile | null;
      if (profile?.username) setUsername(profile.username);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
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
          message: 'Unable to load habits right now. Please refresh and try again.',
          type: 'error',
          isVisible: true,
        });
        return;
      }

      if (data) setStreaks(data);
    } catch (err) {
      console.error('Unexpected error fetching streaks:', err);
      setToast({
        message: 'Connection issue detected. Please try again in a moment.',
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
        message: 'Enter a habit name to continue.',
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
          message: 'Session ended. Please log in again.',
          type: 'error',
          isVisible: true,
        });
        router.push('/login');
        return;
      }

      const { data: insertedRows, error } = await supabase
        .from('streaks')
        .insert([{ user_id: session.user.id, habit: newHabit.trim() }])
        .select()
        .limit(1);

      if (!error) {
        const habitName = newHabit.trim();
        setNewHabit('');
        setIsAddModalOpen(false);
        if (insertedRows && insertedRows[0]) {
          setStreaks((prev) => [insertedRows[0] as Streak, ...prev]);
        } else {
          await fetchStreaks(session.user.id);
        }
        setToast({
          message: `Habit "${habitName}" is ready for today.`,
          type: 'success',
          isVisible: true,
        });
      } else {
        setToast({
          message:
            error.message.includes('network') || error.message.includes('fetch')
              ? 'Network issue detected. Please try again.'
              : `Unable to add habit: ${error.message}`,
          type: 'error',
          isVisible: true,
        });
      }
    } catch (err) {
      console.error('Error adding habit:', err);
      setToast({
        message: 'Could not add habit right now. Please try again.',
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
          message: 'Session ended. Please log in again.',
          type: 'error',
          isVisible: true,
        });
        router.push('/login');
        return;
      }

      const habit = streaks.find((s) => s.id === habitId);
      if (!habit) {
        setToast({
          message: 'Habit not found. Refresh and try again.',
          type: 'error',
          isVisible: true,
        });
        return;
      }

      const today = getTodayDate();
      const lastCheck = toDateOnly(habit.last_check_in);
      const yesterday = getYesterdayDate();

      if (lastCheck === today) {
        setCheckInMessage('Today is already logged. Consistency builds strength.');
        setIsCheckInModalOpen(true);
        return;
      }

      const hadGap = Boolean(lastCheck && lastCheck !== yesterday && lastCheck !== today);
      const newCurrent = hadGap ? 1 : (habit.current_streak || 0) + 1;
      const newLongest = Math.max(habit.longest_streak || 0, newCurrent);
      const nextCheckInIso = new Date().toISOString();

      const { error } = await supabase
        .from('streaks')
        .update({
          current_streak: newCurrent,
          longest_streak: newLongest,
          last_check_in: nextCheckInIso,
        })
        .eq('id', habitId)
        .eq('user_id', session.user.id);

      if (!error) {
        setStreaks((prev) =>
          prev.map((item) =>
            item.id === habitId
              ? {
                  ...item,
                  current_streak: newCurrent,
                  longest_streak: newLongest,
                  last_check_in: nextCheckInIso,
                }
              : item
          )
        );

        setCheckInMessage(
          hadGap
            ? 'Restart recorded. Progress is cumulative, and today counts.'
            : `Streak continued: ${newCurrent} day${newCurrent === 1 ? '' : 's'}.`
        );
        setHighlightedHabitId(habitId);
        setTimeout(() => setHighlightedHabitId(null), 700);
        setIsCheckInModalOpen(true);
      } else {
        setToast({
          message:
            error.message.includes('network') || error.message.includes('fetch')
              ? 'Network issue detected. Please try again.'
              : `Unable to check in: ${error.message}`,
          type: 'error',
          isVisible: true,
        });
      }
    } catch (err) {
      console.error('Error checking in:', err);
      setToast({
        message: 'Check-in could not be completed. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteHabitModal = (habit: Streak) => {
    setHabitToDelete(habit);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setToast({ message: 'Session ended. Please log in again.', type: 'error', isVisible: true });
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('streaks')
        .delete()
        .eq('id', habitToDelete.id)
        .eq('user_id', session.user.id);

      if (error) {
        setToast({
          message: `Unable to delete habit: ${error.message}`,
          type: 'error',
          isVisible: true,
        });
        return;
      }

      setStreaks((prev) => prev.filter((item) => item.id !== habitToDelete.id));
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
      setToast({ message: 'Habit removed successfully.', type: 'success', isVisible: true });
    } catch (err) {
      console.error('Error deleting habit:', err);
      setToast({ message: 'Delete failed. Please try again.', type: 'error', isVisible: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uncheckedHabits = useMemo(() => streaks.filter((habit) => !isCheckedToday(habit.last_check_in)), [streaks]);
  const checkedTodayCount = streaks.length - uncheckedHabits.length;

  const topFocusHabit = useMemo(() => {
    if (streaks.length === 0) return null;
    return [...streaks].sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))[0];
  }, [streaks]);

  const highestStreak = useMemo(
    () => streaks.reduce((max, streak) => Math.max(max, streak.longest_streak || 0), 0),
    [streaks]
  );

  const totalCurrent = useMemo(
    () => streaks.reduce((sum, streak) => sum + (streak.current_streak || 0), 0),
    [streaks]
  );

  const weeklyCells = useMemo(() => getWeeklyCells(streaks), [streaks]);

  const weeklyConsistency = useMemo(() => {
    if (!weeklyCells.length) return 0;
    const activeDays = weeklyCells.filter((day) => day.hasActivity).length;
    return Math.round((activeDays / weeklyCells.length) * 100);
  }, [weeklyCells]);

  const completionRate = useMemo(() => {
    if (!weeklyCells.length) return 0;
    const avgIntensity = weeklyCells.reduce((sum, day) => sum + day.intensity, 0) / weeklyCells.length;
    return Math.round(avgIntensity * 100);
  }, [weeklyCells]);

  const trendData = useMemo(() => {
    if (weeklyCells.length < 6) return { label: 'Stable pace', delta: 0 };
    const values = weeklyCells.map((d) => d.intensity);
    const previousAvg = (values[0] + values[1] + values[2]) / 3;
    const recentAvg = (values[4] + values[5] + values[6]) / 3;
    const delta = Math.round((recentAvg - previousAvg) * 100);

    if (delta > 8) return { label: 'Strengthening rhythm', delta };
    if (delta < -8) return { label: 'Recovering focus', delta };
    return { label: 'Stable pace', delta };
  }, [weeklyCells]);

  const focusCurrent = topFocusHabit?.current_streak || 0;
  const focusLongest = Math.max(topFocusHabit?.longest_streak || 0, 1);
  const focusProgress = Math.min(Math.round((focusCurrent / Math.max(focusLongest, 21)) * 100), 100);

  const handlePrimaryAction = () => {
    if (uncheckedHabits.length === 0) {
      setCheckInMessage('All habits are logged for today. Keep this pace tomorrow.');
      setIsCheckInModalOpen(true);
      return;
    }

    if (uncheckedHabits.length === 1) {
      void handleCheckIn(uncheckedHabits[0].id);
      return;
    }

    setIsHabitsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="surface p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/70 border-t-transparent" />
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
          <button className="btn btn-ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="section">
        <div className="app-container space-y-6">
          <section className="surface-strong p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div>
                <p className="eyebrow">Today</p>
                <h1 className="mt-2">{focusCurrent} day focus streak</h1>
                <p className="text-body mt-2 max-w-xl">
                  {topFocusHabit
                    ? `${username ? `${username}, ` : ''}primary habit: ${topFocusHabit.habit}. ${getRelativeGrowthTone(focusCurrent)}.`
                    : `${username ? `${username}, ` : ''}begin with one habit. Today counts.`}
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button className="btn btn-primary" onClick={handlePrimaryAction} disabled={isSubmitting || streaks.length === 0}>
                    <Flame className="h-4 w-4" />
                    {uncheckedHabits.length === 0 ? 'All Logged Today' : 'Check In Now'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(true)}>
                    <CirclePlus className="h-4 w-4" />
                    Add Habit
                  </button>
                </div>
                <p className="text-caption mt-3">Consistency builds strength.</p>
              </div>

              <div className="focus-ring-wrap">
                <div className="focus-ring" style={{ ['--ring-progress' as string]: `${focusProgress}` }}>
                  <div className="focus-ring-center">
                    <span className="focus-ring-value">{focusCurrent}</span>
                    <span className="text-caption">current days</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="surface p-4 sm:p-5">
              <p className="text-caption">Current active streak</p>
              <p className="metric-value mt-1">{focusCurrent} days</p>
            </article>

            <article className="surface p-4 sm:p-5">
              <p className="text-caption">Highest streak</p>
              <p className="metric-value mt-1">{highestStreak} days</p>
            </article>

            <article className="surface p-4 sm:p-5">
              <p className="text-caption">Weekly consistency</p>
              <p className="metric-value mt-1">{weeklyConsistency}%</p>
            </article>

            <article className="surface p-4 sm:p-5">
              <p className="text-caption">Completion trend</p>
              <p className="metric-value mt-1">{completionRate}%</p>
              <p className="text-caption mt-1">
                {trendData.label}
                {trendData.delta !== 0 ? ` (${trendData.delta > 0 ? '+' : ''}${trendData.delta}%)` : ''}
              </p>
            </article>
          </section>

          <section className="space-y-3">
            <div className="section-header mb-0">
              <h3>Active habits</h3>
              <p className="text-caption mt-1">Completed today: {checkedTodayCount} of {streaks.length}</p>
            </div>

            {streaks.length === 0 ? (
              <div className="surface p-8 text-center sm:p-10">
                <Target className="mx-auto h-8 w-8 text-emerald-300" />
                <h3 className="mt-4">Start with one habit</h3>
                <p className="text-body mt-2">Choose a simple daily action. Keep it steady.</p>
                <button className="btn btn-primary mt-5" onClick={() => setIsAddModalOpen(true)}>
                  Add Your First Habit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {streaks.map((streak) => {
                  const checkedToday = isCheckedToday(streak.last_check_in);
                  const needsRestart = isStreakBroken(streak.last_check_in) && !checkedToday;
                  const progress = Math.min(
                    Math.round(((streak.current_streak || 0) / Math.max(streak.longest_streak || 1, 14)) * 100),
                    100
                  );

                  return (
                    <article
                      key={streak.id}
                      className={`surface habit-row p-4 sm:p-5 ${highlightedHabitId === streak.id ? 'habit-row-boost' : ''}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4>{streak.habit}</h4>
                          <p className="text-caption mt-1">
                            {needsRestart ? 'Pause detected. Restart with intention.' : getRelativeGrowthTone(streak.current_streak || 0)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="chip">{streak.current_streak || 0}d current</span>
                          <span className="chip chip-soft">{streak.longest_streak || 0}d best</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-caption">Progress to personal best</p>
                          <p className="text-caption">{progress}%</p>
                        </div>
                        <div className="progress-track mt-2">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <button
                          onClick={() => openDeleteHabitModal(streak)}
                          disabled={isSubmitting}
                          className="btn btn-ghost self-start sm:self-auto"
                          aria-label={`Delete ${streak.habit}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>

                        <button
                          onClick={() => handleCheckIn(streak.id)}
                          disabled={isSubmitting || checkedToday}
                          className={`btn ${checkedToday ? 'btn-secondary' : 'btn-secondary-emphasis'}`}
                        >
                          {checkedToday ? (
                            <>
                              <Check className="h-4 w-4" />
                              Logged Today
                            </>
                          ) : needsRestart ? (
                            <>
                              <RotateCcw className="h-4 w-4" />
                              Restart Today
                            </>
                          ) : (
                            <>
                              <Flame className="h-4 w-4" />
                              Continue Streak
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="surface p-5 sm:p-6">
              <h3>Weekly consistency</h3>
              <p className="text-caption mt-1">Visible momentum over the last seven days.</p>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {weeklyCells.map((day) => (
                  <div key={day.key} className="text-center">
                    <div
                      className="week-cell"
                      style={{
                        opacity: day.hasActivity ? 0.35 + day.intensity * 0.65 : 0.16,
                      }}
                      aria-label={`${day.label}: ${day.hasActivity ? 'active' : 'inactive'}`}
                    />
                    <p className="mt-2 text-[11px] text-slate-400">{day.label}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface p-5 sm:p-6">
              <h3>History</h3>
              <div className="mt-4 space-y-3">
                <div className="metric-row">
                  <div className="metric-copy">
                    <p className="text-caption">Highest streak</p>
                    <p className="metric-value">{highestStreak} days</p>
                  </div>
                  <Trophy className="h-5 w-5 text-emerald-300" />
                </div>

                <div className="metric-row">
                  <div className="metric-copy">
                    <p className="text-caption">Current total</p>
                    <p className="metric-value">{totalCurrent} days</p>
                  </div>
                  <Flame className="h-5 w-5 text-sky-300" />
                </div>

                <div className="metric-row">
                  <div className="metric-copy">
                    <p className="text-caption">Weekly trend</p>
                    <p className="metric-value">{trendData.label}</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-sky-300" />
                </div>
              </div>
            </article>
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
                  <h3 className="mt-2">Name your next commitment</h3>
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
                    placeholder="e.g. 20 minutes of reading"
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
            <div className="modal-panel pop-in max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 sm:p-7">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="eyebrow">Check In</p>
                  <h3 className="mt-2">Choose one habit for today</h3>
                </div>
                <button className="btn btn-ghost h-8 w-8 p-0" onClick={() => setIsHabitsModalOpen(false)} aria-label="Close modal">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {uncheckedHabits.map((streak) => (
                  <article key={streak.id} className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5>{streak.habit}</h5>
                      <p className="text-caption mt-1">
                        Current: {streak.current_streak || 0} days | Best: {streak.longest_streak || 0} days
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary-emphasis"
                      onClick={() => {
                        setIsHabitsModalOpen(false);
                        void handleCheckIn(streak.id);
                      }}
                      disabled={isSubmitting}
                    >
                      Continue
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isDeleteModalOpen && habitToDelete && (
        <>
          <div className="modal-overlay fade-in" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-panel pop-in w-full max-w-md p-6 sm:p-7">
              <p className="eyebrow">Delete Habit</p>
              <h3 className="mt-2">Remove &quot;{habitToDelete.habit}&quot;?</h3>
              <p className="text-body mt-3">
                This habit will be removed from your dashboard and leaderboard calculations. This action cannot be undone.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setHabitToDelete(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button className="btn btn-secondary-emphasis" onClick={handleDeleteHabit} disabled={isSubmitting}>
                  {isSubmitting ? 'Deleting...' : 'Delete Habit'}
                </button>
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
              <h3>Daily update</h3>
              <p className="text-body mt-3">{checkInMessage || 'Saved.'}</p>
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

