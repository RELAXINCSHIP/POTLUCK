console.log("Starting local-server.js...");
import express from 'express';
import cors from 'cors';
console.log("Imports loaded");
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Dynamic route loader for Vercel functions
const createHandler = (handlerPath) => async (req, res) => {
    try {
        const handler = await import(handlerPath);
        await handler.default(req, res);
    } catch (err) {
        console.error(`Error executing ${handlerPath}:`, err);
        res.status(500).json({ error: 'Internal server error in local dev wrapper' });
    }
};

app.all('/api/market/crypto', createHandler('./api/market/crypto.js'));
app.all('/api/market/stocks', createHandler('./api/market/stocks.js'));
app.all('/api/plaid/accounts', createHandler('./api/plaid/accounts.js'));
app.all('/api/plaid/create-link-token', createHandler('./api/plaid/create-link-token.js'));
app.all('/api/plaid/exchange-token', createHandler('./api/plaid/exchange-token.js'));
app.all('/api/plaid/transactions', createHandler('./api/plaid/transactions.js'));
app.all('/api/rates', createHandler('./api/rates.js'));
app.all('/api/travel/deals', createHandler('./api/travel/deals.js'));
app.all('/api/v1/agent/sync-assets', createHandler('./api/v1/agent/sync-assets.js'));

console.log("Starting listener...");
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Local Dev Backend running on http://localhost:${port}`));
