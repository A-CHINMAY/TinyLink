document.addEventListener('DOMContentLoaded', async () => {
    const loadingDiv = document.getElementById('loading');
    const statsContainer = document.getElementById('stats-container');
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const originalUrlElement = document.getElementById('original-url');
    const shortUrlElement = document.getElementById('short-url');
    const createdDateElement = document.getElementById('created-date');
    const totalClicksElement = document.getElementById('total-clicks');
    const countriesContainer = document.getElementById('countries-container');
    const copyBtn = document.getElementById('copy-btn');


    const urlParams = new URLSearchParams(window.location.search);
    const shortCode = urlParams.get('code');

    console.log("Extracted shortCode:", shortCode);

    if (!shortCode) {
        hideLoading();
        showError('No URL code provided');
        return;
    }

    try {
        const response = await fetch(`api/stats/${shortCode}`);

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch statistics');
        }

        const data = await response.json();
        hideLoading();
        showStats(data);
    } catch (error) {
        hideLoading();
        showError(error.message || 'An error occurred');
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const shortUrl = shortUrlElement.textContent;

            navigator.clipboard.writeText(shortUrl)
                .then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                })
                .catch((error) => {
                    console.error('Error copying text:', error);
                });
        });
    }
    function showStats(data) {
        originalUrlElement.textContent = data.originalUrl;
        originalUrlElement.href = data.originalUrl;
        shortUrlElement.textContent = data.shortUrl;
        shortUrlElement.href = data.shortUrl;

        const createdDate = new Date(data.createdAt);
        createdDateElement.textContent = createdDate.toLocaleDateString() + ' ' +
            createdDate.toLocaleTimeString();
        totalClicksElement.textContent = data.clicks;
        renderCountriesChart(data.countries);
        renderDailyClicksChart(data.dailyClicks);
        statsContainer.classList.remove('hidden');
    }

    function renderCountriesChart(countries) {
        countriesContainer.innerHTML = '';
        const countriesArray = Object.entries(countries).map(([name, count]) => ({ name, count }));
        countriesArray.sort((a, b) => b.count - a.count);

        countriesArray.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            const countryName = document.createElement('div');
            countryName.className = 'country-name';
            countryName.textContent = country.name;
            const countryVisits = document.createElement('div');
            countryVisits.className = 'country-visits';
            countryVisits.textContent = country.count;
            countryItem.appendChild(countryName);
            countryItem.appendChild(countryVisits);
            countriesContainer.appendChild(countryItem);
        });

        if (countriesArray.length === 0) {
            const noData = document.createElement('div');
            noData.className = 'no-data';
            noData.textContent = 'No geographic data available yet';
            countriesContainer.appendChild(noData);
        }
    }


    function renderDailyClicksChart(dailyClicks) {
        const ctx = document.getElementById('daily-chart').getContext('2d');
        const labels = Object.keys(dailyClicks).map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const values = Object.values(dailyClicks);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clicks',
                    data: values,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    function hideLoading() {
        loadingDiv.classList.add('hidden');
    }
});
