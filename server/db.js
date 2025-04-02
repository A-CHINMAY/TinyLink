const mongoose = require('mongoose');
require('dotenv').config();

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    clicks: {
        type: Number,
        default: 0
    }
});


const visitSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Url',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    country: {
        type: String,
        default: 'Unknown'
    }
});


const Url = mongoose.model('Url', urlSchema);
const Visit = mongoose.model('Visit', visitSchema);


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    Url,
    Visit
};