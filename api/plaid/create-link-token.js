import { plaidClient } from '../_lib/plaid.js';
import { getSupabase } from '../_lib/supabase.js';
import { Products, CountryCode } from 'plaid';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = getSupabase(req);

    try {
        // 1. Get the authenticated user from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized: Please log in' });
        }

        // 2. Create Link Token
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: user.id },
            client_name: 'Potluck',
            products: [Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
        });
        res.status(200).json({ link_token: response.data.link_token });
    } catch (err) {
        console.error('Error creating link token:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.error_message || err.message });
    }
}
