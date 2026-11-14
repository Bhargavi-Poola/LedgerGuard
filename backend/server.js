const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.json({
        project: 'LedgerGuard',
        message: 'Backend is running successfully!',
        status: 'Success'
    });
});

// Health route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Healthy',
        message: 'LedgerGuard API is working!'
    });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

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