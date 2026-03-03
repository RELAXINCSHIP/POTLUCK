// Shared Plaid client for all serverless functions
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const plaidConfig = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

export const plaidClient = new PlaidApi(plaidConfig);

// In-memory store for access tokens (per Vercel invocation — 
// for production, use a database like Supabase)
// NOTE: Vercel serverless functions are stateless. For persistence 
// across invocations, we'll use Supabase to store tokens.
// For now, this enables the sandbox flow within a single warm instance.
const tokenStore = globalThis.__plaidTokenStore || new Map();
globalThis.__plaidTokenStore = tokenStore;

export function storeToken(userId, accessToken, itemId) {
    const key = userId || 'default';
    if (!tokenStore.has(key)) tokenStore.set(key, []);
    tokenStore.get(key).push({ access_token: accessToken, item_id: itemId });
}

export function getTokens(userId) {
    return tokenStore.get(userId || 'default') || [];
}
