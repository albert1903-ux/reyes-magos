// Vercel Serverless Function to proxy SerpAPI requests and avoid CORS issues

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'imageUrl is required' });
        }

        const SERPAPI_KEY = process.env.VITE_SERPAPI_KEY;

        if (!SERPAPI_KEY) {
            console.error('SerpAPI key not configured');
            return res.status(500).json({ error: 'SerpAPI key not configured' });
        }

        console.log('Searching for image:', imageUrl);

        // Call SerpAPI from server-side (no CORS issues)
        const params = new URLSearchParams({
            engine: 'google_lens',
            url: imageUrl,
            api_key: SERPAPI_KEY,
        });

        const apiUrl = `https://serpapi.com/search.json?${params}`;
        console.log('Calling SerpAPI...');

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error('SerpAPI error:', response.status, data);
            return res.status(response.status).json({
                error: data.error || `SerpAPI error: ${response.status}`,
                details: data
            });
        }

        console.log('SerpAPI success, found results:', data.visual_matches?.length || 0);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in SerpAPI proxy:', error);
        return res.status(500).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
