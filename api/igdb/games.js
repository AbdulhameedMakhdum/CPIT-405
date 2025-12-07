export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Client-ID, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': req.headers['client-id'],
                'Authorization': req.headers['authorization'],
                'Content-Type': 'text/plain'
            },
            body: req.body
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('IGDB error:', error);
        res.status(500).json({ error: 'Failed to fetch from IGDB' });
    }
}
