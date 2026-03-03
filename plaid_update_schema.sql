-- Add persistent token storage for Plaid
ALTER TABLE public.linked_accounts 
ADD COLUMN IF NOT EXISTS plaid_access_token text;

-- Optional: Comments for clarity
COMMENT ON COLUMN public.linked_accounts.plaid_access_token IS 'Stored Plaid access token (Sandbox/Beta only. Encrypt in Production)';
