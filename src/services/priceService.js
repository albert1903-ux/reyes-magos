// Mock service to simulate image recognition and price comparison

const STORES = [
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'El Corte Inglés', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/El_Corte_Ingl%C3%A9s_logo.svg' },
    { name: 'ToysRUs', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Toys_R_Us_logo.svg' },
    { name: 'Juguettos', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Juguettos.png' },
];

export const priceService = {
    analyzeAndSearch: async (imageUrl) => {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Generate random prices
                const prices = STORES.map(store => ({
                    store: store.name,
                    price: (Math.random() * (50 - 10) + 10).toFixed(2), // Random price between 10 and 50
                    url: '#',
                })).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

                resolve({
                    productName: 'Juguete Detectado (Simulación)',
                    prices: prices,
                    bestPrice: prices[0],
                });
            }, 2000); // 2 seconds delay
        });
    },
};
