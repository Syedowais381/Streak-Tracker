'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck2,
  Instagram,
  Repeat2,
  Sparkles,
  Target,
  TrendingUp,
  Twitter,
  Zap,
} from 'lucide-react';

import Toast from './components/Toast';
import { supabase } from '../lib/supabase';

const HERO_QUOTE = 'You are stronger than you think.';

type ToastState = {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
};

type Story = {
  name: string;
  quote: string;
  avatarInitials: string;
};

type LeaderboardStreak = {
  id: string;
  habit: string;
  current_streak: number;
  user_id: string;
  user_email?: string | null;
  user_name?: string;
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardStreak[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const router = useRouter();

  const howItWorks = useMemo(
    () => [
      {
        Icon: Target,
        title: 'Set Your Habit',
        description: 'Pick one habit you want to build. Start small and stay consistent.',
      },
      {
        Icon: CalendarCheck2,
        title: 'Daily Check-in',
        description: 'Mark the day as done in seconds. No friction — just progress.',
      },
      {
        Icon: TrendingUp,
        title: 'Watch Streak Grow',
        description: 'Your streak becomes your momentum. Track wins and keep going.',
      },
    ],
    []
  );

  const whyTrack = useMemo(
    () => [
      {
        Icon: Zap,
        title: 'Boost Focus',
        description: 'A clear daily target helps you show up — even on hard days.',
      },
      {
        Icon: Repeat2,
        title: 'Build Consistency',
        description: 'Tiny actions compound. A streak makes discipline feel automatic.',
      },
      {
        Icon: Sparkles,
        title: 'Achieve Growth',
        description: 'See your progress over time and turn habits into identity.',
      },
    ],
    []
  );

  const stories: Story[] = useMemo(
    () => [
      {
        name: 'Ava M.',
        quote: 'I stopped relying on motivation. The streak keeps me honest.',
        avatarInitials: 'AM',
      },
      {
        name: 'Noah K.',
        quote: 'Daily check-ins are so satisfying — it feels like leveling up.',
        avatarInitials: 'NK',
      },
      {
        name: 'Sophia R.',
        quote: 'Glass UI is gorgeous. And yes… I finally built consistency.',
        avatarInitials: 'SR',
      },
      {
        name: 'Liam T.',
        quote: 'The dashboard makes progress obvious. I’m not stopping now.',
        avatarInitials: 'LT',
      },
      {
        name: 'Mia J.',
        quote: 'I love how simple it is: one habit, one tap, one day at a time.',
        avatarInitials: 'MJ',
      },
      {
        name: 'Ethan P.',
        quote: 'Streaks turned my routine into a game — and I’m winning it.',
        avatarInitials: 'EP',
      },
    ],
    []
  );

  useEffect(() => {
    setIsLoaded(true);

    // Check if user is already logged in and redirect to dashboard
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };

    checkUser();
    fetchLeaderboard();
  }, [router]);

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      console.log('Fetching leaderboard...');
      
      // Fetch from API route which has access to user emails
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        console.error('Leaderboard API error:', response.statusText);
        // Fallback to direct query if API fails
        const { data: streaksData, error } = await supabase
          .from('streaks')
          .select('id, habit, current_streak, user_id')
          .order('current_streak', { ascending: false, nullsFirst: false })
          .limit(20);
        
        if (streaksData && streaksData.length > 0) {
          const sortedStreaks = [...streaksData].sort((a, b) => {
            const aStreak = a.current_streak ?? 0;
            const bStreak = b.current_streak ?? 0;
            return bStreak - aStreak;
          });
          
          const leaderboardWithUsers = sortedStreaks.slice(0, 10).map(streak => ({
            ...streak,
            user_email: null,
            user_name: 'Unknown User',
          }));
          
          setLeaderboard(leaderboardWithUsers);
        } else {
          setLeaderboard([]);
        }
        setLeaderboardLoading(false);
        return;
      }
      
      const { data: leaderboardData } = await response.json();
      
      console.log('Leaderboard API result:', { 
        dataCount: leaderboardData?.length || 0,
        sampleData: leaderboardData?.slice(0, 3)
      });
      
      if (leaderboardData && leaderboardData.length > 0) {
        // API already returns top users with highest streak per user
        // Just map to include user_name for display
        const topStreaks = leaderboardData.slice(0, 10).map((item: any) => ({
          ...item,
          user_name: item.username,
          habit: 'Top Streak', // Leaderboard shows user's best streak, not a specific habit
        }));
        
        console.log('Top streaks for leaderboard:', topStreaks.map((s: any) => ({
          streak: s.current_streak ?? 0,
          userName: s.user_name
        })));
        
        setLeaderboard(topStreaks);
      } else {
        console.log('No streaks data returned from API');
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Helper function to extract name from email
  const extractNameFromEmail = (email: string | null | undefined): string | null => {
    if (!email) return null;
    
    // Extract the part before @
    const localPart = email.split('@')[0];
    
    // Remove common patterns: numbers at the end, "test", "demo", etc.
    let cleaned = localPart
      .replace(/\d+$/, '') // Remove trailing numbers
      .replace(/^(test|demo|temp|user|admin)/i, '') // Remove common prefixes
      .replace(/[._-]/g, ' '); // Replace separators with spaces
    
    // Split by spaces and filter out empty/very short parts
    const nameParts = cleaned
      .split(/\s+/)
      .filter(part => part.length > 1 && !/^\d+$/.test(part))
      .map(part => {
        // Capitalize properly
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      });
    
    if (nameParts.length >= 2) {
      // Multiple parts - join them (e.g., "John Doe")
      return nameParts.join(' ');
    } else if (nameParts.length === 1) {
      // Single part - use it (e.g., "John")
      return nameParts[0];
    }
    
    // Fallback: use the original local part, capitalized
    if (localPart.length > 0) {
      // Remove numbers and capitalize
      const cleanedLocal = localPart.replace(/\d+/g, '');
      if (cleanedLocal.length > 0) {
        return cleanedLocal.charAt(0).toUpperCase() + cleanedLocal.slice(1).toLowerCase();
      }
      // If all numbers, use first few chars
      return localPart.substring(0, 8).charAt(0).toUpperCase() + localPart.substring(1, 8).toLowerCase();
    }
    
    return null;
  };

  // Helper function to generate user initials from email or user_id
  const getUserInitials = (username: string | null | undefined): string => {
    if (!username) return 'US';
    
    // Get initials from username
    const parts = username.split('_');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    // Single word username - get first two characters
    if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase();
    }
    
    return username.toUpperCase();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-primary">
      {/* Background */}
      <div className="fixed inset-0 bg-dot-pattern" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-glow-blob animate-pulse-glow" />
      <div
        className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-glow-blob opacity-20 animate-pulse-glow anim-delay-1000"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <a
            href="#"
            className="text-green-100 font-extrabold tracking-tight uppercase text-base sm:text-lg md:text-xl text-shadow-glow-sm whitespace-nowrap"
          >
            Streak Tracker
          </a>

          <div className="ml-auto flex items-center gap-3 sm:gap-5 md:gap-8">
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a className="nav-link text-sm font-semibold whitespace-nowrap" href="#features">
                Features
              </a>
              <a className="nav-link text-sm font-semibold whitespace-nowrap" href="#stories">
                Stories
              </a>
              <a className="nav-link text-sm font-semibold whitespace-nowrap" href="#about">
                About
              </a>
              <a className="nav-link text-sm font-semibold whitespace-nowrap" href="#leaderboard">
                Leaderboard
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg glass-card hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>

            <button
              onClick={() => router.push('/signup')}
              className="btn-primary text-white font-bold py-2 px-3 sm:py-2.5 sm:px-5 rounded-xl shadow-lg text-xs sm:text-sm md:text-base whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-green-400/20 bg-black/40 backdrop-blur-lg">
            <nav className="flex flex-col px-4 py-3 gap-3">
              <a 
                className="nav-link text-sm font-semibold py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" 
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                className="nav-link text-sm font-semibold py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" 
                href="#stories"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Stories
              </a>
              <a 
                className="nav-link text-sm font-semibold py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" 
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                className="nav-link text-sm font-semibold py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" 
                href="#leaderboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Leaderboard
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-16 sm:pt-20">
        {/* Hero (kept, enhanced with subtle motion) */}
        <section className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-neon-hero mb-4 sm:mb-6 md:mb-8 uppercase tracking-tighter leading-tight animate-float">
                STREAK TRACKER
              </h1>
              <div className="w-20 sm:w-28 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-6 sm:mb-8 animate-pulse-soft" />
            </div>

            <blockquote
              className={`text-base sm:text-lg md:text-2xl lg:text-3xl italic text-green-200 mb-8 sm:mb-10 md:mb-14 leading-relaxed max-w-3xl mx-auto ${
                isLoaded ? 'animate-fade-in' : 'opacity-0'
              }`}
            >
              <span className="text-green-400 text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-3">"</span>
              {HERO_QUOTE}
              <span className="text-green-400 text-2xl sm:text-3xl md:text-4xl ml-2 sm:ml-3">"</span>
            </blockquote>

            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center mb-8 sm:mb-10 animate-slide-up anim-delay-200"
            >
              <button
                onClick={() => router.push('/login')}
                className="btn-outline-glass text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-xl text-base sm:text-lg md:text-xl shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Login</span>
                </span>
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="btn-primary text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-xl text-base sm:text-lg md:text-xl shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>Sign Up</span>
                </span>
              </button>
            </div>

            <div
              className="flex items-center justify-center gap-2 text-green-300 text-sm md:text-base animate-fade-in anim-delay-400"
            >
              <span className="text-green-400">🔥</span>
              <p>
                Join <span className="font-bold text-green-200">1,000+</span> builders on their journey
              </p>
              <span className="text-green-400">🔥</span>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="features" className="section-anchor px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-neon-heading mb-2 sm:mb-3">
                How it Works
              </h2>
              <p className="text-green-200/80 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Build momentum with a simple flow: set a habit, check in daily, and let the streak do the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {howItWorks.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="glass-card glass-card-hover rounded-2xl p-7 relative overflow-hidden group"
                >
                  <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-green-400/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-green-400/30 bg-white/5">
                        <Icon className="w-6 h-6 text-green-200" />
                      </div>
                      <h3 className="text-xl font-extrabold text-green-100">{title}</h3>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400/50 to-transparent mb-4 opacity-60" />
                    <p className="text-green-200/85 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Track */}
        <section id="about" className="section-anchor px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-neon-heading mb-2 sm:mb-3">
                Why Track?
              </h2>
              <p className="text-green-200/80 max-w-2xl mx-auto text-sm sm:text-base px-4">
                When progress is visible, consistency becomes natural. Track it — and make it real.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {whyTrack.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="glass-card glass-card-hover rounded-2xl p-7 relative overflow-hidden group"
                >
                  <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-green-400/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-green-400/30 bg-white/5">
                        <Icon className="w-6 h-6 text-green-200" />
                      </div>
                      <h3 className="text-xl font-extrabold text-green-100">{title}</h3>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400/50 to-transparent mb-4 opacity-60" />
                    <p className="text-green-200/85 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories (infinite marquee) */}
        <section id="stories" className="section-anchor px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-neon-heading mb-2 sm:mb-3">
                Success Stories
              </h2>
              <p className="text-green-200/80 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Real people. Real consistency. Real momentum.
              </p>
            </div>

            <div className="marquee">
              <div className="marquee-track">
                <div className="flex shrink-0 gap-6 pr-6">
                  {stories.map((s, index) => (
                    <div
                      key={`story-${index}`}
                      className="glass-card glass-card-hover rounded-2xl p-6 min-w-[280px] md:min-w-[340px]"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-green-400/25 flex items-center justify-center text-green-100 font-bold">
                          {s.avatarInitials}
                        </div>
                        <div>
                          <p className="text-green-100 font-bold">{s.name}</p>
                          <p className="text-green-300/70 text-xs">Streak Builder</p>
                        </div>
                      </div>
                      <p className="text-green-100/90 leading-relaxed">“{s.quote}”</p>
                    </div>
                  ))}
                </div>

                <div className="flex shrink-0 gap-6 pr-6">
                  {stories.map((s, index) => (
                    <div
                      key={`story-duplicate-${index}`}
                      className="glass-card glass-card-hover rounded-2xl p-6 min-w-[280px] md:min-w-[340px]"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-green-400/25 flex items-center justify-center text-green-100 font-bold">
                          {s.avatarInitials}
                        </div>
                        <div>
                          <p className="text-green-100 font-bold">{s.name}</p>
                          <p className="text-green-300/70 text-xs">Streak Builder</p>
                        </div>
                      </div>
                      <p className="text-green-100/90 leading-relaxed">“{s.quote}”</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section id="leaderboard" className="section-anchor px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-neon-heading mb-2 sm:mb-3">
                Leaderboard
              </h2>
              <p className="text-green-200/80 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Weekly Champions - Celebrate the top streakers!
              </p>
            </div>

            {leaderboardLoading ? (
              <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                <p className="text-green-300 text-sm sm:text-base">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                <div className="text-5xl sm:text-6xl mb-4">🏆</div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-200 mb-2">No streaks yet</h3>
                <p className="text-green-300 text-sm sm:text-base">Be the first to start a streak!</p>
                <p className="text-green-400/60 text-xs sm:text-sm mt-2">(Check browser console for debugging info)</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {leaderboard.map((streak, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
                  const userInitials = getUserInitials(streak.user_name);
                  const userName = streak.user_name || 'Unknown User';
                  return (
                    <div
                      key={streak.id}
                      className={`glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group ${
                        isTop3 ? 'border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-transparent' : ''
                      }`}
                    >
                      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-green-400/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                            isTop3 ? 'bg-yellow-400/20 border-2 border-yellow-400/50' : 'bg-white/10 border border-green-400/25'
                          }`}>
                            {isTop3 ? medal : `#${rank}`}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-8 h-8 rounded-full bg-white/10 border border-green-400/25 flex items-center justify-center text-green-100 font-bold text-xs">
                                {userInitials}
                              </div>
                              <h3 className="text-lg font-extrabold text-green-100">{userName}</h3>
                            </div>
                            <p className="text-green-300/70 text-sm">🔥 {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''} streak</p>
                          </div>
                        </div>
                        {isTop3 && (
                          <div className="text-center mt-3">
                            <span className="text-yellow-400 text-sm font-semibold uppercase tracking-wide">
                              {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Third Place'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 pb-8 sm:pb-12 md:pb-14">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center md:justify-start">
                  <span className="text-green-100 font-extrabold uppercase tracking-tight text-shadow-glow-sm whitespace-nowrap text-sm sm:text-base">
                    Streak Tracker
                  </span>
                  <span className="hidden sm:inline text-green-200/40">•</span>
                  <p className="text-green-200/80 text-xs sm:text-sm whitespace-nowrap">
                    © {new Date().getFullYear()} All rights reserved
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 sm:gap-4 md:gap-6 md:flex-nowrap">
                  <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
                    <a className="nav-link text-xs sm:text-sm font-semibold" href="/privacy">
                      Privacy
                    </a>
                    <a className="nav-link text-xs sm:text-sm font-semibold" href="/terms">
                      Terms
                    </a>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <a
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-card glass-card-hover flex items-center justify-center border border-green-400/15 hover:border-green-400/40 transition-colors"
                      href="https://x.com/OwaisQuadri12"
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    </a>
                    <a
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-card glass-card-hover flex items-center justify-center border border-green-400/15 hover:border-green-400/40 transition-colors"
                      href="https://www.instagram.com/_ali_6618/"
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
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
