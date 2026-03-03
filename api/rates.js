export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Frankfurter is a free open-source API for current and historical foreign exchange rates published by the European Central Bank
        const url = 'https://api.frankfurter.app/latest?from=USD';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Frankfurter responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Add USD as 1.0 baseline
        res.status(200).json({
            base: 'USD',
            date: data.date,
            rates: { ...data.rates, USD: 1.0, BTC: 0.00001, ETH: 0.0003, SOL: 0.007 }
        });
    } catch (err) {
        console.error('Error fetching exchange rates:', err.message);
        // Fallback standard rates
        res.status(200).json({
            base: 'USD',
            rates: { USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 150.4, CAD: 1.35, AUD: 1.52, BTC: 0.00001 }
        });
    }
}
