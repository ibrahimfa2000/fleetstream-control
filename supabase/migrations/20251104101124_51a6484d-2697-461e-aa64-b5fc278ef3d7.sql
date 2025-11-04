-- Remove the overly permissive INSERT policy on profiles table
-- The handle_new_user() trigger function has SECURITY DEFINER which bypasses RLS,
-- so no explicit INSERT policy is needed for legitimate user creation
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;