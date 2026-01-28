import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key to bypass RLS for admin operations
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET() {
  try {
    const supabaseClient = supabaseAdmin || createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch the highest streak per user with their profile information
    // This query groups by user_id and gets the maximum streak for each user
    const { data: leaderboardData, error: leaderboardError } = await supabaseClient
      .from('streaks')
      .select('user_id, current_streak')
      .order('current_streak', { ascending: false });

    if (leaderboardError) {
      console.error('Error fetching streaks:', leaderboardError);
      return NextResponse.json({ error: leaderboardError.message }, { status: 500 });
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Group by user_id and keep only the highest streak per user
    const userStreakMap = new Map<string, number>();
    leaderboardData.forEach((streak: any) => {
      const currentMax = userStreakMap.get(streak.user_id) || 0;
      if (streak.current_streak > currentMax) {
        userStreakMap.set(streak.user_id, streak.current_streak);
      }
    });

    // Convert to array and sort by streak descending
    const topUsers = Array.from(userStreakMap.entries())
      .map(([userId, maxStreak]) => ({ userId, maxStreak }))
      .sort((a, b) => b.maxStreak - a.maxStreak)
      .slice(0, 20);

    if (topUsers.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Fetch user profiles for top users
    const userIds = topUsers.map(u => u.userId);
    const profileMap = new Map<string, { username: string; age: number }>();
    
    try {
      const { data: profiles, error: profileError } = await supabaseClient
        .from('user_profiles')
        .select('user_id, username, age')
        .in('user_id', userIds);

      if (!profileError && profiles) {
        profiles.forEach((profile: any) => {
          profileMap.set(profile.user_id, {
            username: profile.username,
            age: profile.age,
          });
        });
      } else if (profileError) {
        console.warn('Error fetching profiles:', profileError.message);
      }
    } catch (err) {
      console.warn('Error fetching profiles:', err);
    }

    // Build final leaderboard with usernames and highest streaks
    const finalLeaderboard = topUsers.map(({ userId, maxStreak }) => {
      const profile = profileMap.get(userId);
      return {
        user_id: userId,
        username: profile?.username || 'Unknown User',
        current_streak: maxStreak,
        age: profile?.age || null,
      };
    });

    return NextResponse.json({ data: finalLeaderboard });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
