export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { client_id, client_secret, grant_type } = req.query;

    try {
        const response = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}`,
            { method: 'POST' }
        );

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Token error:', error);
        res.status(500).json({ error: 'Failed to get token' });
    }
}
