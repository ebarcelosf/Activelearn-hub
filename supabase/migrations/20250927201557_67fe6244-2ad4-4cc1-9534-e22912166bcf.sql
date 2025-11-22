-- Fix linter: set search_path on function
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_xp integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE 
    WHEN user_xp >= 1000 THEN RETURN 5;
    WHEN user_xp >= 600 THEN RETURN 4;
    WHEN user_xp >= 300 THEN RETURN 3;
    WHEN user_xp >= 100 THEN RETURN 2;
    ELSE RETURN 1;
  END CASE;
END;
$$;