import { plaidClient } from '../_lib/plaid.js';
import { getSupabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = getSupabase(req);

    try {
        const { public_token, user_id, institution_name } = req.body;
        if (!public_token) {
            return res.status(400).json({ error: 'public_token is required' });
        }

        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Persist to Supabase
        const { error: dbError } = await supabase
            .from('linked_accounts')
            .insert({
                user_id: user_id || 'potluck-user-1', // Fallback for local testing if not using Auth yet
                plaid_access_token: accessToken,
                plaid_item_id: itemId,
                institution_name: institution_name || 'Bank'
            });

        if (dbError) throw dbError;

        console.log(`✅ Token exchanged and persisted for user ${user_id || 'default'}, item ${itemId}`);
        res.status(200).json({ success: true, item_id: itemId });
    } catch (err) {
        console.error('Error exchanging token:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.error_message || err.message });
    }
}
