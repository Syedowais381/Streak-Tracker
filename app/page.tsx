'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarCheck2, ChevronRight, Crown, Flame, LogIn, ShieldCheck, Target, Trophy, Users } from 'lucide-react';

import { supabase } from '../lib/supabase';

type LeaderboardItem = {
  user_id: string;
  current_streak: number;
  username?: string;
  habit?: string;
};

type CommunityStats = {
  totalHabits: number;
  trackedUsers: number;
  activeToday: number;
  topStreak: number;
};

type LeaderboardResponse = {
  data?: LeaderboardItem[];
  stats?: CommunityStats;
};

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalHabits: 0,
    trackedUsers: 0,
    activeToday: 0,
    topStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          router.push('/dashboard');
          return;
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }

      await fetchCommunity();
    };

    void checkUser();
  }, [router]);

  const fetchCommunity = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Leaderboard request failed');

      const payload = (await response.json()) as LeaderboardResponse;
      setLeaderboard((payload.data || []).slice(0, 8));
      setStats(
        payload.stats || {
          totalHabits: 0,
          trackedUsers: 0,
          activeToday: 0,
          topStreak: 0,
        }
      );
    } catch (err) {
      console.error('Community fetch failed:', err);
      setLeaderboard([]);
      setStats({ totalHabits: 0, trackedUsers: 0, activeToday: 0, topStreak: 0 });
    } finally {
      setLoading(false);
    }
  };

  const heroStats = useMemo(
    () => [
      {
        label: 'Habits tracked',
        value: stats.totalHabits,
        Icon: Target,
      },
      {
        label: 'Users building streaks',
        value: stats.trackedUsers,
        Icon: Users,
      },
      {
        label: 'Checked in today',
        value: stats.activeToday,
        Icon: CalendarCheck2,
      },
      {
        label: 'Top live streak',
        value: `${stats.topStreak}d`,
        Icon: Trophy,
      },
    ],
    [stats]
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="app-container flex h-16 items-center justify-between">
          <Link href="/" className="brand">
            Streak Tracker
          </Link>

          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" onClick={() => router.push('/login')}>
              <LogIn className="h-4 w-4" />
              Log In
            </button>
            <button className="btn btn-primary" onClick={() => router.push('/signup')}>
              Start Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="app-container space-y-6">
          <section className="surface-strong p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="eyebrow">Calm discipline system</p>
                <h1 className="mt-2">Build consistency with clarity, not noise.</h1>
                <p className="text-body mt-3 max-w-xl">
                  A focused daily tracker designed for steady attention and long-term habit recovery.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button className="btn btn-primary" onClick={() => router.push('/signup')}>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="btn btn-secondary" onClick={() => router.push('/login')}>
                    Continue Session
                  </button>
                </div>
              </div>

              <div className="surface p-4 sm:p-5">
                <p className="text-caption">Live community snapshot</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {heroStats.map(({ label, value, Icon }) => (
                    <article key={label} className="home-stat-card">
                      <Icon className="h-4 w-4 text-sky-300" />
                      <p className="home-stat-value">{value}</p>
                      <p className="text-caption">{label}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="surface p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <h3 className="mt-3">Low-stimulation interface</h3>
              <p className="text-body mt-2">One clear action per step with intentional pacing and minimal distractions.</p>
            </article>

            <article className="surface p-5">
              <Flame className="h-5 w-5 text-sky-300" />
              <h3 className="mt-3">Real progress visibility</h3>
              <p className="text-body mt-2">Current streaks, best streaks, and trend direction from your stored habit records.</p>
            </article>

            <article className="surface p-5">
              <Target className="h-5 w-5 text-emerald-300" />
              <h3 className="mt-3">Recovery-first framing</h3>
              <p className="text-body mt-2">Missed day messaging supports reset and continuation without failure-based pressure.</p>
            </article>
          </section>

          <section className="surface p-5 sm:p-6" id="leaderboard">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Leaderboard</p>
                <h3 className="mt-1">Current top streaks</h3>
                <p className="text-caption mt-1">Based on each user’s highest active habit streak.</p>
              </div>
              <button className="btn btn-ghost" onClick={fetchCommunity} disabled={loading}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-4 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-300/70 border-t-transparent" />
                <p className="text-caption mt-2">Loading live data...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,white_10%)] p-5 text-center">
                <p className="text-body">No streak entries yet.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {leaderboard.map((entry, index) => (
                  <article key={`${entry.user_id}-${index}`} className="leaderboard-row">
                    <div className="flex items-center gap-3">
                      <div className="leader-rank">#{index + 1}</div>
                      <div>
                        <h5>{entry.username || 'Unknown User'}</h5>
                        <p className="text-caption">{entry.habit || 'Habit'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-100">
                      {index === 0 && <Crown className="h-4 w-4 text-amber-300" />}
                      {entry.current_streak}d
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3>Start today</h3>
                <p className="text-body mt-1">Consistency starts with one deliberate check-in.</p>
              </div>
              <button className="btn btn-primary" onClick={() => router.push('/signup')}>
                Build My Dashboard
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

