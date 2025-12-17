-- Fix Leaderboard RLS Policy
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Step 1: Check if RLS is enabled (it should be)
-- If RLS is not enabled, enable it first:
-- ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policy if it exists (optional, to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read for leaderboard" ON public.streaks;

-- Step 3: Create a policy that allows anonymous users to read streaks
CREATE POLICY "Allow public read for leaderboard" 
ON public.streaks
FOR SELECT
TO anon
USING (true);

-- Step 4: Verify the policy was created
-- You should see the policy in: Authentication > Policies > streaks table

-- Alternative: If you want authenticated users to also read all streaks (not just their own)
-- Uncomment the following:
-- CREATE POLICY "Allow authenticated read for leaderboard" 
-- ON public.streaks
-- FOR SELECT
-- TO authenticated
-- USING (true);
