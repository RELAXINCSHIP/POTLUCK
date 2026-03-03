import { plaidClient } from '../_lib/plaid.js';
import { getSupabase } from '../_lib/supabase.js';
import { CountryCode } from 'plaid';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = getSupabase(req);

    try {
        const userId = req.query.user_id || 'potluck-user-1';

        // Fetch tokens from Supabase
        const { data: linkedItems, error: dbError } = await supabase
            .from('linked_accounts')
            .select('plaid_access_token, institution_name')
            .eq('user_id', userId);

        if (dbError) throw dbError;

        if (!linkedItems || linkedItems.length === 0) {
            return res.status(200).json({ accounts: [], linked: false });
        }

        const allAccounts = [];
        for (const item of linkedItems) {
            const response = await plaidClient.accountsGet({
                access_token: item.plaid_access_token,
            });

            const institutionName = item.institution_name || 'Bank';

            for (const acct of response.data.accounts) {
                allAccounts.push({
                    id: acct.account_id,
                    name: acct.name,
                    official_name: acct.official_name,
                    type: acct.type,
                    subtype: acct.subtype,
                    mask: acct.mask,
                    balance_available: acct.balances.available,
                    balance_current: acct.balances.current,
                    currency: acct.balances.iso_currency_code || 'USD',
                    institution: institutionName,
                });
            }
        }

        res.status(200).json({ accounts: allAccounts, linked: true });
    } catch (err) {
        console.error('Error fetching accounts:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.error_message || err.message });
    }
}
