-- Remove role column from profiles table (now using separate user_roles table)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;