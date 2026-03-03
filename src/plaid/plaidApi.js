// ─── Plaid API Helpers ────────────────────────────────────────
// All requests go to /api/plaid/* which Vite proxies to Express backend

const BASE = '/api/plaid';

export async function createLinkToken(userId) {
    const res = await fetch(`${BASE}/create-link-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to create link token');
    return res.json();
}

export async function exchangePublicToken(publicToken, userId) {
    const res = await fetch(`${BASE}/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken, user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to exchange token');
    return res.json();
}

export async function getAccounts(userId) {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    const res = await fetch(`${BASE}/accounts?${params}`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
}

export async function getTransactions(userId, startDate, endDate) {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const res = await fetch(`${BASE}/transactions?${params}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}
