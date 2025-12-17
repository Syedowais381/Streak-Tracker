import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key to bypass RLS and fetch user emails (if available)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET() {
  try {
    // If no service key, use regular client (will respect RLS)
    const supabaseClient = supabaseAdmin || createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch streaks with user_ids
    const { data: streaks, error: streaksError } = await supabaseClient
      .from('streaks')
      .select('id, habit, current_streak, user_id')
      .order('current_streak', { ascending: false })
      .limit(20);

    if (streaksError) {
      console.error('Error fetching streaks:', streaksError);
      return NextResponse.json({ error: streaksError.message }, { status: 500 });
    }

    if (!streaks || streaks.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Try to fetch user emails if service key is available
    const userEmailMap = new Map<string, string>();
    if (supabaseAdmin) {
      try {
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (!usersError && users) {
          users.users.forEach(user => {
            if (user.email) {
              userEmailMap.set(user.id, user.email);
            }
          });
        }
      } catch (err) {
        console.error('Error fetching user emails:', err);
        // Continue without emails
      }
    }

    // Combine streaks with user emails
    const leaderboardData = streaks.map(streak => {
      const email = userEmailMap.get(streak.user_id);
      return {
        ...streak,
        user_email: email || null,
      };
    });

    return NextResponse.json({ data: leaderboardData });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
