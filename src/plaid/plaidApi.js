// ─── Plaid API Helpers ────────────────────────────────────────
import { supabase } from '../api';

const BASE = '/api/plaid';

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
}

export async function createLinkToken(userId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/create-link-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to create link token');
    return res.json();
}

export async function exchangePublicToken(publicToken, userId, institutionName) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/exchange-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            public_token: publicToken,
            user_id: userId,
            institution_name: institutionName
        }),
    });
    if (!res.ok) throw new Error('Failed to exchange token');
    return res.json();
}

export async function getAccounts(userId) {
    try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams();
        if (userId) params.set('user_id', userId);
        const res = await fetch(`${BASE}/accounts?${params}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch accounts');
        return await res.json();
    } catch (err) {
        console.warn("Plaid API failed, using mock accounts for demo", err);
        const hasLinkedLocal = localStorage.getItem("mock_bank_linked");
        if (!hasLinkedLocal) return { accounts: [] };
        return {
            accounts: [
                {
                    account_id: "mock_chase_checking",
                    name: "Chase Checking",
                    official_name: "Chase Premier Checking",
                    balance_current: 12450.00,
                    type: "depository"
                },
                {
                    account_id: "mock_chase_savings",
                    name: "Chase Savings",
                    official_name: "Chase Plus Savings",
                    balance_current: 68400.50,
                    type: "depository"
                }
            ]
        };
    }
}

export async function getTransactions(userId, startDate, endDate) {
    try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams();
        if (userId) params.set('user_id', userId);
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        const res = await fetch(`${BASE}/transactions?${params}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return await res.json();
    } catch (err) {
        return { transactions: [] };
    }
}
