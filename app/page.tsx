'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarCheck2,
  ChevronRight,
  Crown,
  Menu,
  Repeat2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

import { supabase } from '../lib/supabase';

const HERO_QUOTE = 'You are stronger than you think.';

type Story = {
  name: string;
  quote: string;
};

type LeaderboardStreak = {
  id: string;
  habit: string;
  current_streak: number;
  user_id: string;
  user_email?: string | null;
  user_name?: string;
};

type LeaderboardApiItem = {
  id: string;
  user_id: string;
  current_streak: number;
  username?: string;
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStreak[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const router = useRouter();

  const howItWorks = useMemo(
    () => [
      {
        Icon: Target,
        title: 'Set One Habit',
        description: 'Choose a meaningful habit and keep the daily target simple.',
      },
      {
        Icon: CalendarCheck2,
        title: 'Check In Daily',
        description: 'A fast check-in flow removes friction and keeps you consistent.',
      },
      {
        Icon: TrendingUp,
        title: 'Build Momentum',
        description: 'Track visible progress and let streaks reinforce your routine.',
      },
    ],
    []
  );

  const whyTrack = useMemo(
    () => [
      {
        Icon: Zap,
        title: 'Protect Focus',
        description: 'A daily commitment helps you prioritize what matters most.',
      },
      {
        Icon: Repeat2,
        title: 'Stay Consistent',
        description: 'Small repeated wins compound into long-term behavior change.',
      },
      {
        Icon: Sparkles,
        title: 'See Real Progress',
        description: 'Your streak history creates proof of growth and accountability.',
      },
    ],
    []
  );

  const stories: Story[] = useMemo(
    () => [
      {
        name: 'Ava M.',
        quote: 'I no longer wait for motivation. My streak keeps me honest.',
      },
      {
        name: 'Noah K.',
        quote: 'The daily check-in is fast, and the progress is impossible to ignore.',
      },
      {
        name: 'Sophia R.',
        quote: 'It feels calm and focused. I only need one minute to stay on track.',
      },
    ],
    []
  );

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) router.push('/dashboard');
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
      const response = await fetch('/api/leaderboard');

      if (!response.ok) {
        const { data: streaksData } = await supabase
          .from('streaks')
          .select('id, habit, current_streak, user_id')
          .order('current_streak', { ascending: false, nullsFirst: false })
          .limit(20);

        if (streaksData && streaksData.length > 0) {
          const sortedStreaks = [...streaksData].sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0));
          const leaderboardWithUsers = sortedStreaks.slice(0, 10).map((streak) => ({
            ...streak,
            user_email: null,
            user_name: 'Unknown User',
          }));
          setLeaderboard(leaderboardWithUsers);
        } else {
          setLeaderboard([]);
        }
        return;
      }

      const { data: leaderboardData } = (await response.json()) as { data?: LeaderboardApiItem[] };

      if (leaderboardData && leaderboardData.length > 0) {
        const topStreaks = leaderboardData.slice(0, 10).map((item) => ({
          ...item,
          user_name: item.username,
          habit: 'Top Streak',
        }));
        setLeaderboard(topStreaks);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const getUserInitials = (username: string | null | undefined): string => {
    if (!username) return 'US';
    const parts = username.split('_');
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (username.length >= 2) return username.slice(0, 2).toUpperCase();
    return username.toUpperCase();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="app-container flex h-16 items-center gap-4">
          <a href="#" className="brand">
            Streak Tracker
          </a>

          <nav className="ml-auto hidden items-center gap-6 md:flex">
            <a className="text-body hover:text-white transition-colors" href="#features">
              Features
            </a>
            <a className="text-body hover:text-white transition-colors" href="#stories">
              Stories
            </a>
            <a className="text-body hover:text-white transition-colors" href="#leaderboard">
              Leaderboard
            </a>
          </nav>

          <button className="btn btn-primary hidden md:inline-flex" onClick={() => router.push('/signup')}>
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            className="btn btn-ghost md:hidden"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="app-container pb-4 md:hidden fade-in">
            <nav className="surface flex flex-col gap-2 p-3">
              <a className="btn btn-ghost justify-start" href="#features" onClick={() => setIsMobileMenuOpen(false)}>
                Features
              </a>
              <a className="btn btn-ghost justify-start" href="#stories" onClick={() => setIsMobileMenuOpen(false)}>
                Stories
              </a>
              <a className="btn btn-ghost justify-start" href="#leaderboard" onClick={() => setIsMobileMenuOpen(false)}>
                Leaderboard
              </a>
              <button className="btn btn-primary justify-center" onClick={() => router.push('/signup')}>
                Create Account
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="section">
          <div className="app-container">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <div className="eyebrow">Built for daily consistency</div>
                <h1>Track habits with structure, momentum, and clarity.</h1>
                <p className="text-body-lg max-w-xl">{HERO_QUOTE} Turn that into a repeatable system with streak-first tracking.</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="btn btn-primary" onClick={() => router.push('/signup')}>
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="btn btn-secondary" onClick={() => router.push('/login')}>
                    Log In
                  </button>
                </div>
                <p className="text-caption">No setup friction. Add your first habit in under one minute.</p>
              </div>

              <aside className="surface-strong p-5 sm:p-6">
                <p className="eyebrow mb-4">Today at a glance</p>
                <div className="space-y-4">
                  <div className="metric">
                    <div className="flex items-center justify-between">
                      <h4>Focus Goal</h4>
                      <span className="text-success text-sm font-semibold">On Track</span>
                    </div>
                    <p className="text-caption mt-2">Check in daily to protect your active streak.</p>
                  </div>
                  <div className="metric">
                    <div className="flex items-center justify-between">
                      <h4>Weekly Momentum</h4>
                      <span className="text-warning text-sm font-semibold">+18%</span>
                    </div>
                    <div className="progress-track mt-3">
                      <div className="progress-fill" style={{ width: '72%' }} />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="app-container">
            <div className="section-header">
              <p className="eyebrow">Process</p>
              <h2>Simple workflow, consistent execution.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map(({ Icon, title, description }) => (
                <article key={title} className="surface p-5 sm:p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                  <Icon className="h-6 w-6 text-blue-300" />
                  <h3 className="mt-4">{title}</h3>
                  <p className="text-body mt-2">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="stories" className="section">
          <div className="app-container">
            <div className="section-header">
              <p className="eyebrow">Outcomes</p>
              <h2>What users say after building a streak habit.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stories.map((story) => (
                <article key={story.name} className="surface p-5 sm:p-6">
                  <p className="text-body">&quot;{story.quote}&quot;</p>
                  <p className="mt-4 text-sm font-semibold text-slate-200">{story.name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="app-container">
            <div className="section-header">
              <p className="eyebrow">Why it works</p>
              <h2>A focused system that reinforces consistency.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {whyTrack.map(({ Icon, title, description }) => (
                <article key={title} className="surface p-5 sm:p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                  <Icon className="h-6 w-6 text-emerald-300" />
                  <h3 className="mt-4">{title}</h3>
                  <p className="text-body mt-2">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="leaderboard" className="section">
          <div className="app-container">
            <div className="section-header">
              <p className="eyebrow">Community</p>
              <h2>Leaderboard</h2>
              <p className="text-body mt-2">Top streak builders this week.</p>
            </div>

            {leaderboardLoading ? (
              <div className="surface p-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
                <p className="text-body mt-3">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="surface p-8 text-center">
                <Trophy className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-3">No streaks yet</h3>
                <p className="text-body mt-1">Be the first to build momentum.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leaderboard.map((streak, index) => {
                  const rank = index + 1;
                  const topRank = rank <= 3;
                  const userName = streak.user_name || 'Unknown User';
                  const userInitials = getUserInitials(streak.user_name);

                  return (
                    <article
                      key={streak.id}
                      className={`surface p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
                        topRank ? 'border-amber-400/35' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-700/40 text-xs font-semibold text-slate-100">
                            {userInitials}
                          </div>
                          <div>
                            <h4>{userName}</h4>
                            <p className="text-caption">{streak.current_streak} day streak</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-200">
                          {rank === 1 && <Crown className="h-4 w-4 text-amber-300" />}
                          #{rank}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="section pt-2">
        <div className="app-container">
          <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption">© {new Date().getFullYear()} Streak Tracker</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link className="btn btn-ghost" href="/privacy">
                Privacy
              </Link>
              <Link className="btn btn-ghost" href="/terms">
                Terms
              </Link>
              <button className="btn btn-secondary" onClick={() => router.push('/signup')}>
                Join Now
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

