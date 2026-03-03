export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const API_KEY = process.env.FINNHUB_API_KEY;
    const symbols = ['SPY', 'AAPL']; // Let's track S&P500 proxy and Apple

    try {
        if (!API_KEY) throw new Error('FINNHUB_API_KEY is not set');

        const results = {};
        for (const symbol of symbols) {
            // Finnhub quote endpoint
            const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Finnhub error for ${symbol}`);

            const data = await response.json();
            // Finnhub response map: c = current, d = change, dp = percent change
            results[symbol] = {
                price: data.c,
                change: data.d,
                percent_change: data.dp
            };
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching stock prices:', err.message);
        // Fallback mock data
        res.status(200).json({
            SPY: { price: 590.20, change: 4.5, percent_change: 0.8 },
            AAPL: { price: 235.10, change: -1.2, percent_change: -0.5 }
        });
    }
}
