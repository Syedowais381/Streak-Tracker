import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type StreakRow = {
  user_id: string;
  current_streak: number | null;
  habit: string | null;
  last_check_in?: string | null;
};

type UserProfileRow = {
  user_id: string;
  username: string | null;
  age: number | null;
};

type TopUser = {
  userId: string;
  maxStreak: number;
  habit: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET() {
  try {
    const supabaseClient =
      supabaseAdmin ||
      createClient(
        supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

    const { data: streakRows, error: streakError } = await supabaseClient
      .from('streaks')
      .select('user_id, current_streak, habit, last_check_in')
      .order('current_streak', { ascending: false });

    if (streakError) {
      console.error('Error fetching streaks:', streakError);
      return NextResponse.json({ error: streakError.message }, { status: 500 });
    }

    const rows = (streakRows || []) as StreakRow[];
    if (rows.length === 0) {
      return NextResponse.json({
        data: [],
        stats: {
          totalHabits: 0,
          trackedUsers: 0,
          activeToday: 0,
          topStreak: 0,
        },
      });
    }

    const userTopMap = new Map<string, TopUser>();

    rows.forEach((row) => {
      const streakValue = row.current_streak || 0;
      const existing = userTopMap.get(row.user_id);

      if (!existing || streakValue > existing.maxStreak) {
        userTopMap.set(row.user_id, {
          userId: row.user_id,
          maxStreak: streakValue,
          habit: row.habit || 'Habit',
        });
      }
    });

    const topUsers = Array.from(userTopMap.values())
      .sort((a, b) => b.maxStreak - a.maxStreak)
      .slice(0, 20);

    const userIds = topUsers.map((u) => u.userId);
    const profileMap = new Map<string, { username: string; age: number | null }>();

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabaseClient
        .from('user_profiles')
        .select('user_id, username, age')
        .in('user_id', userIds);

      if (!profileError && profiles) {
        (profiles as UserProfileRow[]).forEach((profile) => {
          profileMap.set(profile.user_id, {
            username: profile.username || 'Unknown User',
            age: profile.age,
          });
        });
      } else if (profileError) {
        console.warn('Error fetching profiles:', profileError.message);
      }
    }

    const finalLeaderboard = topUsers.map(({ userId, maxStreak, habit }) => {
      const profile = profileMap.get(userId);
      return {
        user_id: userId,
        username: profile?.username || 'Unknown User',
        current_streak: maxStreak,
        habit,
        age: profile?.age || null,
      };
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const activeToday = rows.filter((row) => {
      if (!row.last_check_in) return false;
      return row.last_check_in >= todayIso;
    }).length;

    return NextResponse.json({
      data: finalLeaderboard,
      stats: {
        totalHabits: rows.length,
        trackedUsers: userTopMap.size,
        activeToday,
        topStreak: topUsers[0]?.maxStreak || 0,
      },
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

