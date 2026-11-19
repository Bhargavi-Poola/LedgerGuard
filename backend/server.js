const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Redis Configuration
const { connectRedis } = require('./config/redis');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const tenantRecordRoutes = require('./routes/tenantRecordRoutes');

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
    res.json({
        project: 'LedgerGuard',
        message: 'Backend is running successfully!',
        status: 'Success'
    });
});

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Healthy',
        message: 'LedgerGuard API is working!'
    });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api', protectedRoutes);

// Tenant Routes
app.use('/api/tenants', tenantRoutes);

// Tenant Record Routes
app.use('/api/tenant-records', tenantRecordRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Connect MongoDB, Redis and Start Server
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in .env file');
        }

        if (!process.env.REDIS_URL) {
            throw new Error('REDIS_URL is missing in .env file');
        }

        // Connect MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');

        // Connect Redis
        await connectRedis();
        console.log('Redis connection established!');

        // Start Express Server
        app.listen(PORT, () => {
            console.log(`LedgerGuard server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();