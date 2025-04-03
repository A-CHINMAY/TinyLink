const axios = require('axios');
const { Url, Visit } = require('../db');

const getCountryFromIP = async (ip) => {
    try {
        if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.0.0.1')) {
            return 'Local';
        }

        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country`);

        if (response.data && response.data.status === 'success') {
            return response.data.country;
        }

        return 'Unknown';
    } catch (error) {
        console.error('Error fetching country data:', error);
        return 'Unknown';
    }
};


const recordVisit = async (urlId, ip) => {
    try {
        const country = await getCountryFromIP(ip);
        const visit = new Visit({
            urlId,
            ipAddress: ip,
            country
        });

        await visit.save();
        return visit;
    } catch (error) {
        console.error('Error recording visit:', error);
        throw error;
    }
};

const getUrlStats = async (shortCode) => {
    try {
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return null;
        }

        const visits = await Visit.find({ urlId: url._id });

        const countryStats = {};
        visits.forEach(visit => {
            const country = visit.country || 'Unknown';
            countryStats[country] = (countryStats[country] || 0) + 1;
        });

        const today = new Date();
        const last7Days = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            last7Days[dateString] = 0;
        }

        visits.forEach(visit => {
            const dateString = visit.timestamp.toISOString().split('T')[0];
            if (last7Days[dateString] !== undefined) {
                last7Days[dateString]++;
            }
        });

        return {
            originalUrl: url.originalUrl,
            shortUrl: `${process.env.BASE_URL}/s/${url.shortCode}`,
            shortCode: url.shortCode,
            createdAt: url.createdAt,
            clicks: url.clicks,
            countries: countryStats,
            dailyClicks: last7Days
        };
    } catch (error) {
        console.error('Error getting URL stats:', error);
        throw error;
    }
};

module.exports = {
    recordVisit,
    getUrlStats
};
