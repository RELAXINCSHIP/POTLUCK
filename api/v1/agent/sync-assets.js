import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Basic security check for Vercel Cron
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return res.status(401).json({ error: 'Unauthorized' });
        // NOTE: During dev, we might allow manual triggers
    }

    try {
        console.log('--- Asset Sync Agent Started ---');

        // 1. Fetch all assets that have a symbol
        const { data: assets, error: assetsError } = await supabase
            .from('assets')
            .select('*')
            .not('symbol', 'is', null);

        if (assetsError) throw assetsError;
        if (!assets || assets.length === 0) {
            return res.status(200).json({ status: 'success', message: 'No assets with symbols to sync' });
        }

        // 2. Group symbols by type
        const cryptoSymbols = [...new Set(assets.filter(a => a.type === 'crypto').map(a => a.symbol.toLowerCase()))];
        const stockSymbols = [...new Set(assets.filter(a => a.type === 'stock' || a.type === 'equity').map(a => a.symbol.toUpperCase()))];

        const prices = {};

        // 3. Fetch Crypto Prices (CoinGecko)
        if (cryptoSymbols.length > 0) {
            try {
                const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbols.join(',')}&vs_currencies=usd`;
                const cgRes = await fetch(cgUrl);
                if (cgRes.ok) {
                    const cgData = await cgRes.json();
                    Object.keys(cgData).forEach(id => {
                        prices[id.toLowerCase()] = cgData[id].usd;
                    });
                }
            } catch (err) {
                console.error('Crypto fetch error:', err.message);
            }
        }

        // 4. Fetch Stock Prices (Finnhub)
        if (stockSymbols.length > 0 && process.env.FINNHUB_API_KEY) {
            for (const symbol of stockSymbols) {
                try {
                    const fhUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
                    const fhRes = await fetch(fhUrl);
                    if (fhRes.ok) {
                        const fhData = await fhRes.json();
                        if (fhData.c) {
                            prices[symbol.toUpperCase()] = fhData.c;
                        }
                    }
                } catch (err) {
                    console.error(`Stock fetch error for ${symbol}:`, err.message);
                }
            }
        }

        // 5. Update Asset Values
        let updatedCount = 0;
        for (const asset of assets) {
            const sym = asset.type === 'crypto' ? asset.symbol.toLowerCase() : asset.symbol.toUpperCase();
            const currentPrice = prices[sym];

            if (currentPrice) {
                const newValue = asset.quantity ? (parseFloat(asset.quantity) * currentPrice) : currentPrice;

                const { error: updateError } = await supabase
                    .from('assets')
                    .update({
                        value: newValue,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', asset.id);

                if (!updateError) updatedCount++;
            }
        }

        console.log(`--- Asset Sync Agent Finished: Managed to update ${updatedCount} assets ---`);
        res.status(200).json({
            status: 'success',
            updated: updatedCount,
            total_checked: assets.length
        });

    } catch (err) {
        console.error('Asset Sync Error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
