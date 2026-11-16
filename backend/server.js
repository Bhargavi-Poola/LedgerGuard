const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

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

// Server Port
const PORT = process.env.PORT || 5000;

// Connect MongoDB and Start Server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully!');

        app.listen(PORT, () => {
            console.log(`LedgerGuard server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

startServer();