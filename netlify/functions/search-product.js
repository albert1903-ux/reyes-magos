// Netlify Function to proxy SerpAPI requests and avoid CORS issues

export async function handler(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { imageUrl } = JSON.parse(event.body);

        if (!imageUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'imageUrl is required' }),
            };
        }

        const SERPAPI_KEY = process.env.VITE_SERPAPI_KEY;

        if (!SERPAPI_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'SerpAPI key not configured' }),
            };
        }

        // Call SerpAPI from server-side (no CORS issues)
        const params = new URLSearchParams({
            engine: 'google_lens',
            url: imageUrl,
            api_key: SERPAPI_KEY,
        });

        const response = await fetch(`https://serpapi.com/search.json?${params}`);

        if (!response.ok) {
            throw new Error(`SerpAPI error: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error in SerpAPI proxy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
