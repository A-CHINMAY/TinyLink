const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./db');
const urlService = require('./services/urlService');
const statsService = require('./services/statsService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();


app.use(cors());

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/stats', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/stats.html'));
});
console.log("Serving static files from:", path.resolve(__dirname, '../public'));

app.post('/api/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const result = await urlService.shortenUrl(url);
        res.json(result);
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Server error while shortening URL' });
    }
});


app.get('/s/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const urlData = await urlService.getOriginalUrl(code);

        if (!urlData) {
            return res.status(404).sendFile(path.resolve(__dirname, '../public/404.html'));
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        statsService.recordVisit(urlData._id, ip).catch(err => {
            console.error('Error recording visit:', err);
        });

        return res.redirect(urlData.originalUrl);
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ error: 'Server error during redirection' });
    }
});


app.get('/api/stats/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const stats = await statsService.getUrlStats(code);

        if (!stats) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Server error while getting stats' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
});


module.exports = app;