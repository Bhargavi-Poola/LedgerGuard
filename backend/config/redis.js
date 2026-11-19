const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('Redis connecting...');
});

redisClient.on('ready', () => {
    console.log('Redis connected successfully!');
});

const connectRedis = async () => {
    try {
        if (!process.env.REDIS_URL) {
            throw new Error('REDIS_URL is missing from environment variables');
        }

        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Redis Connection Failed:', error.message);
        throw error;
    }
};

module.exports = {
    redisClient,
    connectRedis
};