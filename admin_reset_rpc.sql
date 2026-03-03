CREATE OR REPLACE FUNCTION public.admin_reset_system(admin_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin secret before executing destructive operations
  IF admin_secret != 'potluck-admin-2026' THEN
    RAISE EXCEPTION 'Invalid admin secret';
  END IF;

  -- 1. Reset all user profiles to 0 balance and entries
  UPDATE public.profiles 
  SET balance = 0, 
      total_entries = 0
  WHERE id IS NOT NULL;

  -- 2. Delete all deposit/withdrawal history
  DELETE FROM public.deposits WHERE id IS NOT NULL;

  -- 3. Reset all draws to upcoming and wipe winner data
  UPDATE public.draws 
  SET status = 'upcoming', 
      member_count = 0, 
      total_entries = 0, 
      winner_user_id = NULL, 
      winning_amount = 0, 
      completed_at = NULL
  WHERE id IS NOT NULL;

  -- 4. Reset all user streaks
  UPDATE public.streaks 
  SET current_streak = 0, 
      best_streak = 0, 
      multiplier = 1.0, 
      last_draw_id = NULL
  WHERE user_id IS NOT NULL;

  -- 5. Wipe feed events to start fresh
  DELETE FROM public.feed_events WHERE id IS NOT NULL;

  RETURN true;
END;
$$;
