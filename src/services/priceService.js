// Real service using SerpAPI for image recognition and price comparison

const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;
const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json';

export const priceService = {
    analyzeAndSearch: async (imageUrl) => {
        try {
            // Use Google Lens API from SerpAPI
            const params = new URLSearchParams({
                engine: 'google_lens',
                url: imageUrl,
                api_key: SERPAPI_KEY,
            });

            const response = await fetch(`${SERPAPI_ENDPOINT}?${params}`);

            if (!response.ok) {
                throw new Error(`SerpAPI error: ${response.status}`);
            }

            const data = await response.json();

            // Extract product information
            const visualMatches = data.visual_matches || [];
            const productName = visualMatches[0]?.title || 'Producto detectado';

            // Extract shopping results if available
            let prices = [];

            if (data.shopping_results && data.shopping_results.length > 0) {
                prices = data.shopping_results
                    .filter(item => item.price && item.source)
                    .map(item => ({
                        store: item.source,
                        price: parseFloat(item.extracted_price || item.price.replace(/[^0-9.,]/g, '').replace(',', '.')),
                        url: item.link || '#',
                    }))
                    .sort((a, b) => a.price - b.price)
                    .slice(0, 5); // Top 5 results
            }

            // If no shopping results, try to extract from visual matches
            if (prices.length === 0 && visualMatches.length > 0) {
                prices = visualMatches
                    .filter(item => item.price)
                    .map(item => ({
                        store: item.source || 'Tienda online',
                        price: parseFloat(item.price.value || item.price),
                        url: item.link || '#',
                    }))
                    .sort((a, b) => a.price - b.price)
                    .slice(0, 5);
            }

            // Fallback: if still no prices, return message
            if (prices.length === 0) {
                return {
                    productName: productName,
                    prices: [{
                        store: 'No disponible',
                        price: 0,
                        url: '#',
                    }],
                    bestPrice: null,
                    message: 'No se encontraron precios para este producto. Intenta con otra imagen.',
                };
            }

            return {
                productName: productName,
                prices: prices,
                bestPrice: prices[0],
            };
        } catch (error) {
            console.error('Error in SerpAPI search:', error);

            // Return error state
            return {
                productName: 'Error en la búsqueda',
                prices: [{
                    store: 'Error',
                    price: 0,
                    url: '#',
                }],
                bestPrice: null,
                message: `Error: ${error.message}. Verifica tu conexión o la configuración de la API.`,
            };
        }
    },
};
