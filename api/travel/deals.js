// In-memory cache for the Amadeus auth token (Vercel warm instance)
let cachedAmadeusToken = null;
let tokenExpiry = 0;

async function getAmadeusToken() {
    if (cachedAmadeusToken && Date.now() < tokenExpiry) {
        return cachedAmadeusToken;
    }

    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Amadeus credentials not configured in .env");
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    if (!res.ok) {
        throw new Error(`Amadeus auth failed: ${res.statusText}`);
    }

    const data = await res.json();
    cachedAmadeusToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 5000; // buffer
    return cachedAmadeusToken;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const token = await getAmadeusToken();

        // Let's fetch flights from JFK to a destination. 
        // We'll map multiple destinations over a few days from now.
        const departureDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]; // +14 days

        // Let's look up flights to Paris (CDG)
        const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=JFK&destinationLocationCode=CDG&departureDate=${departureDate}&adults=1&nonStop=false&max=3`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Amadeus offers failed: ${await response.text()}`);
        }

        const data = await response.json();

        // Format the results into something our UI expects
        const deals = data.data.map((offer, idx) => ({
            id: `live_${idx}`,
            dest: offer.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode === 'CDG' ? 'Paris, France' : 'Europe',
            hotel: offer.validatingAirlineCodes?.[0] + ' Airlines',
            orig: Math.round(parseFloat(offer.price.total) * 1.5), // fake original price
            deal: Math.round(parseFloat(offer.price.total)),
            nights: "Flight Only",
            img: "✈️",
            save: "33%"
        }));

        res.status(200).json(deals.length > 0 ? deals : getMockDeals());

    } catch (err) {
        console.error('Error fetching Amadeus flights:', err.message);
        // Serve mock travel deals as fallback
        res.status(200).json(getMockDeals());
    }
}

function getMockDeals() {
    return [
        { id: "t1", dest: "Bali, Indonesia", hotel: "The Mulia Resort", orig: 4200, deal: 2940, nights: 5, img: "🏝️", save: "30%" },
        { id: "t2", dest: "Paris, France", hotel: "Le Meurice", orig: 5800, deal: 4060, nights: 4, img: "🗼", save: "30%" },
        { id: "t3", dest: "Tokyo, Japan", hotel: "Aman Tokyo", orig: 6400, deal: 4480, nights: 5, img: "🏯", save: "30%" }
    ];
}
