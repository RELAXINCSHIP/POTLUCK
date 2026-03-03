export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Fetch real-time prices for popular crypto assets from CoinGecko (free, no auth)
        // IDs: bitcoin, ethereum, solana
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`CoinGecko responded with status: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching crypto prices:', err.message);
        // Fallback mock data if API limits hit
        res.status(200).json({
            bitcoin: { usd: 89450.20, usd_24h_change: 2.4 },
            ethereum: { usd: 3450.10, usd_24h_change: 1.1 },
            solana: { usd: 145.30, usd_24h_change: -0.5 }
        });
    }
}
