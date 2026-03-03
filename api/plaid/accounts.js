import { plaidClient, getTokens } from '../_lib/plaid.js';
import { CountryCode } from 'plaid';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const key = req.query.user_id || 'default';
        const items = getTokens(key);

        if (!items || items.length === 0) {
            return res.status(200).json({ accounts: [], linked: false });
        }

        const allAccounts = [];
        for (const item of items) {
            const response = await plaidClient.accountsGet({
                access_token: item.access_token,
            });

            // Get institution info
            let institutionName = 'Bank';
            try {
                if (response.data.item?.institution_id) {
                    const instRes = await plaidClient.institutionsGetById({
                        institution_id: response.data.item.institution_id,
                        country_codes: [CountryCode.Us],
                    });
                    institutionName = instRes.data.institution.name;
                }
            } catch { /* ignore institution lookup failures */ }

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
