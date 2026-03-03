import { plaidClient } from '../_lib/plaid.js';
import { Products, CountryCode } from 'plaid';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: req.body.user_id || 'potluck-user-1' },
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
