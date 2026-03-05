-- REFRESH PLAID SCHEMA
-- Run this in your Supabase SQL Editor to ensure all columns exist

-- 1. Add missing plaid_access_token
ALTER TABLE public.linked_accounts 
ADD COLUMN IF NOT EXISTS plaid_access_token text;

-- 2. Add institution_name if missing (though it exists in current schema, safe to ensure)
ALTER TABLE public.linked_accounts 
ADD COLUMN IF NOT EXISTS institution_name text NOT NULL DEFAULT 'Bank';

-- 3. Ensure RLS is enabled and policies allow insert/select based on user_id
-- We use a DO block to avoid errors if policies already exist
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own linked accounts" ON public.linked_accounts;
    CREATE POLICY "Users can read own linked accounts" ON public.linked_accounts FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own linked accounts" ON public.linked_accounts;
    CREATE POLICY "Users can insert own linked accounts" ON public.linked_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own linked accounts" ON public.linked_accounts;
    CREATE POLICY "Users can delete own linked accounts" ON public.linked_accounts FOR DELETE USING (auth.uid() = user_id);
END $$;
