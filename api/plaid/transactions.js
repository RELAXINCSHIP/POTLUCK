import { plaidClient, getTokens } from '../_lib/plaid.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const key = req.query.user_id || 'default';
        const items = getTokens(key);

        if (!items || items.length === 0) {
            return res.status(200).json({ transactions: [], linked: false });
        }

        // Default: last 30 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const allTransactions = [];
        for (const item of items) {
            const response = await plaidClient.transactionsGet({
                access_token: item.access_token,
                start_date: req.query.start_date || startDate,
                end_date: req.query.end_date || endDate,
                options: { count: 100, offset: 0 },
            });
            allTransactions.push(...response.data.transactions);
        }

        // Sort by date descending
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Map to a clean format
        const transactions = allTransactions.map(tx => ({
            id: tx.transaction_id,
            name: tx.name || tx.merchant_name || 'Unknown',
            merchant: tx.merchant_name,
            amount: tx.amount, // Plaid: positive = debit (money out)
            date: tx.date,
            category: tx.personal_finance_category?.primary || tx.category?.[0] || 'Other',
            pending: tx.pending,
            logo_url: tx.logo_url,
            channel: tx.payment_channel,
        }));

        res.status(200).json({ transactions, linked: true });
    } catch (err) {
        console.error('Error fetching transactions:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.error_message || err.message });
    }
}
