import { plaidClient, storeToken } from '../_lib/plaid.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { public_token, user_id } = req.body;
        if (!public_token) {
            return res.status(400).json({ error: 'public_token is required' });
        }

        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Store token in global object (simulating DB for sandbox)
        storeToken(user_id, accessToken, itemId);

        console.log(`✅ Token exchanged for user ${user_id || 'default'}, item ${itemId}`);
        res.status(200).json({ success: true, item_id: itemId });
    } catch (err) {
        console.error('Error exchanging token:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.error_message || err.message });
    }
}
