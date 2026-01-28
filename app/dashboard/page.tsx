'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      const { data: { session } } = await supabase.auth.getSession();
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

  const ensureProfileExists = async (user: any) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        // Profile doesn't exist, create it from user metadata
        const username = user.user_metadata?.username || 'User';
        const age = user.user_metadata?.age ? parseInt(user.user_metadata.age) : 25;

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              username: username,
              age: age,
            },
          ]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully');
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
          message: 'Failed to load your habits. Please try refreshing the page.',
          type: 'error',
          isVisible: true,
        });
        return;
      }

      if (data) {
        setStreaks(data);
        // Calculate totals
        const totalCurrent = data.reduce((sum, streak) => sum + (streak.current_streak || 0), 0);
        const totalLongest = data.reduce((sum, streak) => sum + (streak.longest_streak || 0), 0);
        const activeCount = data.length;
        setCurrentStreak(totalCurrent);
        setLongestStreak(totalLongest);
        setTotalActive(activeCount);
      }
    } catch (err) {
      console.error('Unexpected error fetching streaks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setToast({
        message: errorMessage.includes('fetch') || errorMessage.includes('network')
          ? 'Network error. Please check your connection and try again.'
          : 'Failed to load your habits. Please try refreshing the page.',
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
        message: 'Please enter a habit name',
        type: 'error',
        isVisible: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToast({
          message: 'Session expired. Please log in again.',
          type: 'error',
          isVisible: true,
        });
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('streaks')
        .insert([{ user_id: session.user.id, habit: newHabit.trim() }]);
      
      if (!error) {
        setIsAddModalOpen(false);
        const habitName = newHabit.trim();
        setNewHabit('');
        setToast({
          message: `Habit "${habitName}" added successfully! 🎉`,
          type: 'success',
          isVisible: true,
        });
        await fetchStreaks(session.user.id);
      } else {
        const errorMessage = error.message.includes('network') || error.message.includes('fetch')
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
        message: errorMessage.includes('fetch') || errorMessage.includes('network')
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToast({
          message: 'Session expired. Please log in again.',
          type: 'error',
          isVisible: true,
        });
        router.push('/login');
        setIsSubmitting(false);
        return;
      }

      const habit = streaks.find(s => s.id === habitId);
      if (!habit) {
        setToast({
          message: 'Habit not found. Please refresh the page.',
          type: 'error',
          isVisible: true,
        });
        setIsSubmitting(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastCheck = habit.last_check_in ? new Date(habit.last_check_in).toISOString().split('T')[0] : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if already checked in today
      if (lastCheck === today) {
        setCheckInMessage('You already checked in today! Keep it up! 🔥');
        setIsCheckInModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // Reset streak if missed a day (not yesterday)
      let newCurrent = habit.current_streak || 0;
      if (lastCheck && lastCheck !== yesterdayStr && lastCheck !== today) {
        newCurrent = 1; // Reset to 1 for today
      } else {
        newCurrent = (newCurrent || 0) + 1;
      }

      const newLongest = Math.max(habit.longest_streak || 0, newCurrent);

      const { error } = await supabase
        .from('streaks')
        .update({ 
          current_streak: newCurrent, 
          longest_streak: newLongest, 
          last_check_in: new Date().toISOString() 
        })
        .eq('id', habitId);

      if (!error) {
        setCheckInMessage(`Great job! Your streak is now ${newCurrent} days! 🎉`);
        setIsCheckInModalOpen(true);
        await fetchStreaks(session.user.id);
      } else {
        const errorMessage = error.message.includes('network') || error.message.includes('fetch')
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
        message: errorMessage.includes('fetch') || errorMessage.includes('network')
          ? 'Network error. Please check your connection and try again.'
          : 'Failed to check in. Please try again.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStreakEmoji = (days: number) => {
    if (days >= 100) return '💎';
    if (days >= 50) return '🏆';
    if (days >= 30) return '⭐';
    if (days >= 7) return '🔥';
    if (days >= 3) return '✨';
    return '🌱';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-green-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
              onClick={handleLogout}
              className="btn-primary text-white font-bold py-2.5 px-5 rounded-xl shadow-lg text-sm md:text-base whitespace-nowrap shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16 sm:pt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neon-hero mb-4 sm:mb-6 md:mb-8 uppercase tracking-tighter leading-tight animate-float">
              YOUR DASHBOARD
            </h1>
            <p className="text-green-300 text-xs sm:text-sm md:text-base">Track your progress and build lasting habits</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg flex items-center gap-2 text-sm sm:text-base w-full md:w-auto justify-center"
            >
              <span>➕</span>
              <span>Add Habit</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
          <div className="stat-card p-4 sm:p-5 md:p-6 rounded-2xl glass-card-hover cursor-pointer" onClick={() => setIsHabitsModalOpen(true)}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-green-100">Current Streak</h3>
              <span className="text-2xl sm:text-3xl">🔥</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-green-300 mb-1">{currentStreak}</p>
            <p className="text-xs sm:text-sm text-green-400">Total days across all habits</p>
          </div>
          <div className="stat-card p-4 sm:p-5 md:p-6 rounded-2xl glass-card-hover">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-green-100">Longest Streak</h3>
              <span className="text-2xl sm:text-3xl">🏆</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-green-300 mb-1">{longestStreak}</p>
            <p className="text-xs sm:text-sm text-green-400">Your personal best</p>
          </div>
          <div className="stat-card p-4 sm:p-5 md:p-6 rounded-2xl glass-card-hover cursor-pointer sm:col-span-2 md:col-span-1" onClick={() => setIsHabitsModalOpen(true)}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-green-100">Active Habits</h3>
              <span className="text-2xl sm:text-3xl">📋</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-green-300 mb-1">{totalActive}</p>
            <p className="text-xs sm:text-sm text-green-400">Habits you're tracking</p>
          </div>
        </div>

        {/* Habits Grid */}
        {streaks.length === 0 ? (
          <div className="glass-card p-8 sm:p-10 md:p-12 rounded-2xl text-center">
            <div className="text-5xl sm:text-6xl mb-4">🌱</div>
            <h2 className="text-xl sm:text-2xl font-bold text-green-200 mb-2">No habits yet</h2>
            <p className="text-green-300 mb-6 text-sm sm:text-base">Start your journey by adding your first habit!</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl shadow-lg text-sm sm:text-base"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {streaks.map((streak) => {
              const progress = streak.longest_streak > 0 
                ? Math.min((streak.current_streak / Math.max(streak.longest_streak, 30)) * 100, 100)
                : 0;
              const isCheckedToday = streak.last_check_in 
                ? new Date(streak.last_check_in).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                : false;

              return (
                <div key={streak.id} className="glass-card p-6 rounded-2xl glass-card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getStreakEmoji(streak.current_streak)}</span>
                        <h2 className="text-xl font-bold text-green-100">{streak.habit}</h2>
                      </div>
                      <div className="flex gap-4 text-sm text-green-300">
                        <span>Current: <strong className="text-green-200">{streak.current_streak || 0}</strong> days</span>
                        <span>Best: <strong className="text-green-200">{streak.longest_streak || 0}</strong> days</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-green-800/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="progress-bar h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-green-400 mt-1">
                      {Math.round(progress)}% of your best streak
                    </p>
                  </div>

                  {/* Check-in Button */}
                  <button
                    onClick={() => handleCheckIn(streak.id)}
                    disabled={isSubmitting || isCheckedToday}
                    className={`w-full font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all shadow-lg text-sm sm:text-base ${
                      isCheckedToday
                        ? 'bg-green-800/50 text-green-400 cursor-not-allowed'
                        : 'btn-primary text-white'
                    } ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span>Processing...</span>
                      </span>
                    ) : isCheckedToday ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>✅</span>
                        <span>Checked In Today</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>🔥</span>
                        <span>Check In Today</span>
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 modal-overlay"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full relative modal-content">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-green-400 hover:text-green-300 text-3xl font-bold z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-900/50 transition-all"
                aria-label="Close modal"
              >
                ×
              </button>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <span className="text-5xl mb-3 block">✨</span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase text-gradient-secondary">
                    Add New Habit
                  </h2>
                  <p className="text-green-300 text-sm">What habit do you want to track?</p>
                </div>
                <form onSubmit={handleAddHabit} className="space-y-5">
                  <div>
                    <label className="block text-green-300 mb-2 text-sm font-medium">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      value={newHabit}
                      onChange={(e) => setNewHabit(e.target.value)}
                      className="input-modern w-full px-4 py-3 rounded-xl text-green-100 placeholder-green-500/50"
                      placeholder="e.g., Daily Exercise, Meditation, Reading"
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        <span>Adding...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>➕</span>
                        <span>Add Habit</span>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Habits List Modal */}
      {isHabitsModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 modal-overlay"
            onClick={() => setIsHabitsModalOpen(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl max-w-2xl w-full relative modal-content max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsHabitsModalOpen(false)}
                className="absolute top-4 right-4 text-green-400 hover:text-green-300 text-3xl font-bold z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-900/50 transition-all"
                aria-label="Close modal"
              >
                ×
              </button>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <span className="text-5xl mb-3 block">📋</span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase text-gradient-secondary">
                    Your Active Habits
                  </h2>
                  <p className="text-green-300 text-sm">{streaks.length} habit{streaks.length !== 1 ? 's' : ''} tracked</p>
                </div>
                <div className="space-y-3">
                  {streaks.map((streak) => (
                    <div key={streak.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStreakEmoji(streak.current_streak)}</span>
                        <div>
                          <h3 className="font-bold text-green-100">{streak.habit}</h3>
                          <p className="text-sm text-green-400">
                            {streak.current_streak || 0} days • Best: {streak.longest_streak || 0} days
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsHabitsModalOpen(false);
                          handleCheckIn(streak.id);
                        }}
                        disabled={isSubmitting}
                        className="btn-primary text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                      >
                        Check In
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Check-in Message Modal */}
      {isCheckInModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 modal-overlay"
            onClick={() => {
              setIsCheckInModalOpen(false);
              setCheckInMessage('');
            }}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full relative modal-content">
              <div className="text-center">
                <span className="text-6xl mb-4 block">
                  {checkInMessage.includes('Error') ? '❌' : checkInMessage.includes('already') ? '🔥' : '🎉'}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase text-gradient-secondary">
                  {checkInMessage.includes('Error') ? 'Oops!' : 'Great Job!'}
                </h2>
                <p className="text-green-200 text-lg mb-6">{checkInMessage || 'Check-in successful!'}</p>
                <button
                  onClick={() => {
                    setIsCheckInModalOpen(false);
                    setCheckInMessage('');
                  }}
                  className="btn-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                  OK
                </button>
              </div>
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
