-- Add settings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system',
ADD COLUMN IF NOT EXISTS show_notifications boolean DEFAULT true;

-- Update the level calculation function
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_xp integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  -- Level system: 1-5 based on XP thresholds
  CASE 
    WHEN user_xp >= 1000 THEN RETURN 5;
    WHEN user_xp >= 600 THEN RETURN 4;
    WHEN user_xp >= 300 THEN RETURN 3;
    WHEN user_xp >= 100 THEN RETURN 2;
    ELSE RETURN 1;
  END CASE;
END;
$$;