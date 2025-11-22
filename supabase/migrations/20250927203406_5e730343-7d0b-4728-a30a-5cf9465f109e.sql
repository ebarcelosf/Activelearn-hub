-- Remove the show_notifications column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS show_notifications;