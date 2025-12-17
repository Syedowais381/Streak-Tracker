# Supabase Setup Instructions

## Environment Variables

For the leaderboard to show user names (extracted from emails), you need to set up the service role key:

1. Go to Supabase Dashboard → Project Settings → API
2. Copy the `service_role` key (NOT the anon key - keep that secret!)
3. Add it to your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

**Note:** The service role key bypasses RLS, so keep it secure and never expose it to the client side. It's only used in the API route server-side.

If you don't set this up, the leaderboard will still work but will show generated names like "Streaker ABC123" instead of names extracted from emails.

## Leaderboard RLS Policy Issue

If the leaderboard is not showing data even though streaks exist in the database, you need to configure Row Level Security (RLS) policies in Supabase.

### Problem
The `streaks` table likely has RLS enabled, which prevents anonymous users (visitors to the home page) from reading streak data for the leaderboard.

### Solution

Go to your Supabase Dashboard → Authentication → Policies → `streaks` table

Create a new policy for SELECT operations:

**Policy Name:** `Allow public read for leaderboard`
**Allowed Operation:** SELECT
**Target Roles:** `anon` (anonymous users)
**Policy Definition:**
```sql
CREATE POLICY "Allow public read for leaderboard" ON streaks
FOR SELECT
TO anon
USING (true);
```

Or using the Supabase SQL Editor, run:

```sql
-- Allow anonymous users to read streaks for leaderboard
CREATE POLICY "Allow public read for leaderboard" 
ON public.streaks
FOR SELECT
TO anon
USING (true);
```

### Alternative: More Restrictive Policy

If you want to be more selective, you can allow reading only specific columns:

```sql
CREATE POLICY "Allow public read for leaderboard" 
ON public.streaks
FOR SELECT
TO anon
USING (true)
WITH CHECK (true);
```

Then grant SELECT on specific columns:
```sql
GRANT SELECT (id, habit, current_streak, user_id) 
ON public.streaks 
TO anon;
```

### Verify

After creating the policy:
1. Refresh your home page
2. Check the browser console for leaderboard query logs
3. The leaderboard should now display streaks

### Current Query

The leaderboard query fetches:
- Top 20 streaks ordered by `current_streak` (descending)
- Displays top 10 in the UI
- Shows user initials and display names generated from `user_id`
