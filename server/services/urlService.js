const validUrl = require('valid-url');
const { Url } = require('../db');
require('dotenv').config();

const generateShortCode = (id) => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let shortCode = '';

    let num = id;
    do {
        shortCode = characters[num % 62] + shortCode;
        num = Math.floor(num / 62);
    } while (num > 0);

    while (shortCode.length < 6) {
        shortCode = '0' + shortCode;
    }

    return shortCode;
};


const getNextSequence = async () => {
    const lastUrl = await Url.findOne().sort({ _id: -1 });
    return lastUrl ? parseInt(lastUrl._id.toString().substring(0, 8), 16) + 1 : 1000;
};

const shortenUrl = async (originalUrl) => {
    if (!validUrl.isUri(originalUrl)) {
        throw new Error('Invalid URL format');
    }

    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
        return {
            originalUrl: existingUrl.originalUrl,
            shortUrl: `${process.env.BASE_URL}/s/${existingUrl.shortCode}`,
            shortCode: existingUrl.shortCode,
            createdAt: existingUrl.createdAt,
            clicks: existingUrl.clicks
        };
    }

    const counter = await getNextSequence();
    const shortCode = generateShortCode(counter);

    const newUrl = new Url({
        originalUrl,
        shortCode
    });

    await newUrl.save();

    return {
        originalUrl: newUrl.originalUrl,
        shortUrl: `${process.env.BASE_URL}/s/${shortCode}`,
        shortCode: shortCode,
        createdAt: newUrl.createdAt,
        clicks: 0
    };
};

const getOriginalUrl = async (shortCode) => {
    const url = await Url.findOneAndUpdate(
        { shortCode },
        { $inc: { clicks: 1 } },
        { new: true }
    );

    return url;
};

module.exports = {
    shortenUrl,
    getOriginalUrl
};