// Real service using SerpAPI for image recognition and price comparison
// Uses serverless function to avoid CORS issues

export const priceService = {
    analyzeAndSearch: async (imageUrl) => {
        try {
            // Call our serverless function instead of SerpAPI directly
            const response = await fetch('/api/search-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();

            console.log('🔍 Raw API Response:', data);
            console.log('🛒 Shopping Results:', data.shopping_results);
            console.log('👁️ Visual Matches:', data.visual_matches);

            // Extract product information
            const visualMatches = data.visual_matches || [];
            const productName = visualMatches[0]?.title || 'Producto detectado';

            // Extract shopping results if available
            let prices = [];

            if (data.shopping_results && data.shopping_results.length > 0) {
                prices = data.shopping_results
                    .filter(item => item.price && item.source)
                    .map(item => {
                        let priceValue = 0;

                        // Try extracted_price first
                        if (item.extracted_price) {
                            priceValue = parseFloat(item.extracted_price);
                        }
                        // Then try to parse price string
                        else if (typeof item.price === 'string') {
                            const cleaned = item.price.replace(/[^0-9.,]/g, '').replace(',', '.');
                            priceValue = parseFloat(cleaned);
                        }
                        // Finally try direct number
                        else if (typeof item.price === 'number') {
                            priceValue = item.price;
                        }

                        console.log('💰 Parsing price for', item.source, ':', {
                            original: item.price,
                            extracted: item.extracted_price,
                            parsed: priceValue
                        });

                        return {
                            store: item.source,
                            title: item.title,
                            price: priceValue,
                            referencePrice: item.old_price ? parseFloat(item.old_price.replace(/[^0-9.,]/g, '').replace(',', '.')) : null,
                            url: item.link || '#',
                        };
                    })
                    .filter(item => !isNaN(item.price) && item.price > 0) // Filter out NaN and 0 prices
                    .sort((a, b) => a.price - b.price)
                    .slice(0, 5); // Top 5 results
            }

            // If no shopping results, try to extract from visual matches
            if (prices.length === 0 && visualMatches.length > 0) {
                console.log('📸 Using visual_matches, first 3 items:', visualMatches.slice(0, 3));

                prices = visualMatches
                    .filter(item => item.price)
                    .map((item, index) => {
                        let priceValue = 0;

                        console.log(`🔢 Visual Match #${index}:`, {
                            source: item.source,
                            title: item.title,
                            priceRaw: item.price,
                            priceType: typeof item.price,
                            extractedValue: item.price?.extracted_value,
                            priceValue: item.price?.value,
                            link: item.link
                        });

                        // Try to parse from price.value first (preserves decimals like "39.95")
                        if (item.price?.value && typeof item.price.value === 'string') {
                            const cleaned = item.price.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                            priceValue = parseFloat(cleaned);
                            console.log(`💰 Parsed from value string: "${item.price.value}" -> ${priceValue}`);
                        }
                        // Fallback to extracted_value (may be rounded)
                        else if (item.price?.extracted_value !== undefined) {
                            priceValue = parseFloat(item.price.extracted_value);
                            console.log(`💰 Using extracted_value: ${priceValue}`);
                        }
                        // Then try price as string
                        else if (typeof item.price === 'string') {
                            const cleaned = item.price.replace(/[^0-9.,]/g, '').replace(',', '.');
                            priceValue = parseFloat(cleaned);
                        }
                        // Then try price as number
                        else if (typeof item.price === 'number') {
                            priceValue = item.price;
                        }

                        console.log(`💵 Final parsed price for ${item.source}:`, priceValue);

                        return {
                            store: item.source || 'Tienda online',
                            title: item.title,
                            price: priceValue,
                            url: item.link || '#',
                        };
                    })
                    .filter(item => !isNaN(item.price) && item.price > 0)
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

            console.log('✅ Price Service Success:', {
                productName,
                pricesCount: prices.length,
                firstPrice: prices[0],
                allPrices: prices
            });

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
