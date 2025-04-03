document.addEventListener('DOMContentLoaded', () => {
    const shortenForm = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const resultDiv = document.getElementById('result');
    const shortUrlInput = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const visitLink = document.getElementById('visit-link');
    const statsLink = document.getElementById('stats-link');
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const loadingDiv = document.getElementById('loading');

    shortenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();

        if (!url) {
            showError('Please enter a URL');
            return;
        }
        showLoading();
        try {
            const response = await fetch('api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            hideLoading();

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to shorten URL');
            }

            const data = await response.json();
            showResult(data);
        } catch (error) {
            hideLoading();
            showError(error.message || 'An error occurred');
        }
    });

    copyBtn.addEventListener('click', () => {
        shortUrlInput.select();
        navigator.clipboard.writeText(shortUrlInput.value)
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

    function showResult(data) {
        errorDiv.classList.add('hidden');
        shortUrlInput.value = data.shortUrl;
        visitLink.href = data.shortUrl;
        statsLink.href = `/stats?code=${data.shortCode}`;
        resultDiv.classList.remove('hidden');
    }

    function showError(message) {
        resultDiv.classList.add('hidden');
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function showLoading() {
        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
    }
    function hideLoading() {
        loadingDiv.classList.add('hidden');
    }
});
