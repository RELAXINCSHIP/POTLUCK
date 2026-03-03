import { createClient } from '@supabase/supabase-js';

export const getSupabase = (req) => {
    // For serverless functions, we use the client-side URL and Anon key 
    // but we can also use Service Role if we need to bypass RLS.
    // For now, these are standard in POTLUCK.
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    // If we have an Authorization header, we can use it to act on behalf of the user
    const authHeader = req.headers['authorization'];

    if (authHeader) {
        return createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });
    }

    return createClient(supabaseUrl, supabaseAnonKey);
};
