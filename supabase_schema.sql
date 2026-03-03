-- Supabase Schema for Potluck

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE public.profiles (
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
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, city)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'city'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. DEPOSITS
CREATE TABLE public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) DEFAULT auth.uid(),
  amount numeric NOT NULL,
  type text NOT NULL CHECK(type IN ('deposit', 'withdraw')),
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. DRAWS
CREATE TABLE public.draws (
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
CREATE POLICY "Draws viewable by everyone" ON public.draws FOR SELECT USING (true);

-- Insert initial draws
INSERT INTO public.draws (type, prize_pool, status, scheduled_at, member_count, total_entries) 
VALUES 
  ('grand', 2412800, 'upcoming', now() + interval '90 days', 84201, 15000000),
  ('mini', 12400, 'upcoming', now() + interval '30 days', 84201, 15000000);

-- 4. STREAKS
CREATE TABLE public.streaks (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) DEFAULT auth.uid(),
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  multiplier numeric DEFAULT 1.0,
  last_draw_id uuid REFERENCES public.draws(id)
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- 5. SYNDICATES
CREATE TABLE public.syndicates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text DEFAULT '🍀',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  member_count integer DEFAULT 1,
  combined_entries integer DEFAULT 0
);
ALTER TABLE public.syndicates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable by all" ON public.syndicates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert" ON public.syndicates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. FEED EVENTS
CREATE TABLE public.feed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  text text NOT NULL,
  emoji text DEFAULT '📢',
  user_id uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.feed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable by all" ON public.feed_events FOR SELECT USING (true);

-- 7. WAITLIST
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  referral_source text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Count viewable by all" ON public.waitlist FOR SELECT USING (true);

-- Insert demo feed events
INSERT INTO public.feed_events (type, text, emoji) VALUES
  ('deposit', 'Sarah M. from Austin added to the pot.', '💰'),
  ('streak', 'James T. hit a 20-draw streak!', '🔥'),
  ('syndicate', 'The "Lucky Sevens" syndicate just gained 5 new members.', '👥');
