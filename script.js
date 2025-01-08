document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('filter');
    const cryptoTableBody = document.getElementById('cryptoData');
    const priceChartCanvas = document.getElementById('priceChart').getContext('2d');
    const liveChartCanvas = document.getElementById('liveChart').getContext('2d');
    
    // Stocke les objets Chart.js
    let priceChart;
    let liveChart;

    // Fonction pour récupérer les données des crypto-monnaies
    async function fetchCryptoData(sortBy = 'market_cap_desc') {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${sortBy}&per_page=10&page=1`);
            const data = await response.json();
            displayCryptoData(data);
            // Mettre à jour le graphique pour Bitcoin (par exemple)
            fetchPriceHistory('bitcoin'); // On peut ajouter un autre crypto-monnaie ici.
        } catch (error) {
            console.error('Erreur de récupération des données', error);
        }
    }

    // Fonction pour afficher les données dans le tableau
    function displayCryptoData(data) {
        cryptoTableBody.innerHTML = ''; // Vide le tableau avant d'ajouter de nouvelles données
        data.forEach(coin => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${coin.name}</td>
                <td>${coin.symbol.toUpperCase()}</td>
                <td>$${coin.current_price.toFixed(2)}</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
                <td>$${coin.total_volume.toLocaleString()}</td>
            `;

            cryptoTableBody.appendChild(row);
        });
    }

    // Récupérer l'historique des prix pour une crypto-monnaie
    async function fetchPriceHistory(coinId) {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`);
            const data = await response.json();

            // Met à jour le graphique avec les données récupérées
            updateChart(data.prices);
            updateLiveChart(data.prices);
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique des prix', error);
        }
    }

    // Met à jour le graphique classique avec les données récupérées
    function updateChart(prices) {
        const labels = prices.map(item => new Date(item[0]).toLocaleTimeString());
        const priceData = prices.map(item => item[1]);

        if (priceChart) {
            priceChart.destroy(); // Détruit l'ancien graphique s'il existe
        }

        priceChart = new Chart(priceChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Prix du Bitcoin (USD)',
                    data: priceData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Heure'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Prix en USD'
                        }
                    }
                }
            }
        });
    }

    // Met à jour le graphique en temps réel avec changement de couleur (vert/rouge)
    function updateLiveChart(prices) {
        const latestPrice = prices[prices.length - 1][1];
        const previousPrice = prices[prices.length - 2] ? prices[prices.length - 2][1] : latestPrice;

        const labels = prices.map(item => new Date(item[0]).toLocaleTimeString());
        const priceData = prices.map(item => item[1]);

        const color = latestPrice > previousPrice ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)'; // Vert si le prix monte, rouge si il baisse

        if (liveChart) {
            liveChart.destroy(); // Détruit l'ancien graphique s'il existe
        }

        liveChart = new Chart(liveChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Évolution en Temps Réel',
                    data: priceData,
                    borderColor: color,
                    backgroundColor: color.replace('1)', '0.2)'),
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Heure'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Prix en USD'
                        }
                    }
                }
            }
        });
    }

    // Récupérer et afficher les données au premier chargement
    fetchCryptoData();

    // Ajouter un événement pour changer l'ordre en fonction du filtre sélectionné
    filterSelect.addEventListener('change', (event) => {
        fetchCryptoData(event.target.value);
    });

    // Mise à jour automatique des données toutes les 60 secondes
    setInterval(() => {
        fetchCryptoData(filterSelect.value);
    }, 60000); // 60 secondes
});