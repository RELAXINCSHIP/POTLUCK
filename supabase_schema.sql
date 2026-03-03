-- Supabase Schema for Potluck (Safe for Re-runs)

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  city text DEFAULT '',
  avatar_emoji text DEFAULT '😊',
  total_entries integer DEFAULT 0,
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger to create profile on signup (with Whitelist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check whitelist
  IF NOT EXISTS (SELECT 1 FROM public.whitelisted_emails WHERE email = new.email) THEN
    RAISE EXCEPTION 'This email is not whitelisted for the Potluck beta.';
  END IF;

  INSERT INTO public.profiles (id, email, name, city)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'city'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. DEPOSITS
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) DEFAULT auth.uid(),
  amount numeric NOT NULL,
  type text NOT NULL CHECK(type IN ('deposit', 'withdraw')),
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can read own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. DRAWS
CREATE TABLE IF NOT EXISTS public.draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK(type IN ('grand', 'mini')),
  prize_pool numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'live', 'completed')),
  scheduled_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone,
  winner_user_id uuid REFERENCES public.profiles(id),
  winning_amount numeric DEFAULT 0,
  member_count integer DEFAULT 0,
  total_entries integer DEFAULT 0
);
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Draws viewable by everyone" ON public.draws FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert initial draws (safely)
INSERT INTO public.draws (type, prize_pool, status, scheduled_at, member_count, total_entries) 
SELECT 'grand', 2412800, 'upcoming', now() + interval '90 days', 84201, 15000000
WHERE NOT EXISTS (SELECT 1 FROM public.draws WHERE type = 'grand');

INSERT INTO public.draws (type, prize_pool, status, scheduled_at, member_count, total_entries) 
SELECT 'mini', 12400, 'upcoming', now() + interval '30 days', 84201, 15000000
WHERE NOT EXISTS (SELECT 1 FROM public.draws WHERE type = 'mini');

-- 4. STREAKS
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) DEFAULT auth.uid(),
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  multiplier numeric DEFAULT 1.0,
  last_draw_id uuid REFERENCES public.draws(id)
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can read own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. SYNDICATES
CREATE TABLE IF NOT EXISTS public.syndicates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text DEFAULT '🍀',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  member_count integer DEFAULT 1,
  combined_entries integer DEFAULT 0
);
ALTER TABLE public.syndicates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Viewable by all" ON public.syndicates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert" ON public.syndicates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. FEED EVENTS
CREATE TABLE IF NOT EXISTS public.feed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  text text NOT NULL,
  emoji text DEFAULT '📢',
  user_id uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.feed_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Viewable by all" ON public.feed_events FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. WAITLIST
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  referral_source text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can insert" ON public.waitlist FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Count viewable by all" ON public.waitlist FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. WHITELIST
CREATE TABLE IF NOT EXISTS public.whitelisted_emails (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert the test profile
INSERT INTO public.whitelisted_emails (email) VALUES ('kenny6b47@gmail.com') ON CONFLICT DO NOTHING;

-- 9. LINKED ACCOUNTS (Plaid)
CREATE TABLE IF NOT EXISTS public.linked_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name text NOT NULL DEFAULT 'Bank',
  account_name text DEFAULT '',
  account_mask text DEFAULT '',
  account_type text DEFAULT 'depository',
  account_subtype text DEFAULT 'checking',
  plaid_item_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can read own linked accounts" ON public.linked_accounts FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own linked accounts" ON public.linked_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own linked accounts" ON public.linked_accounts FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 10. ASSETS (Custom User Assets)
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- e.g. crypto, real_estate, vehicle, watch, art, other
  name text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  icon text DEFAULT '💎',
  bg_image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can read own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
