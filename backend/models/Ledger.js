const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({

    transactionId: {
        type: String,
        required: true,
        unique: true
    },

    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    eventId: {
        type: String,
        required: true,
        unique: true
    },

    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0.01
    },

    description: {
        type: String,
        trim: true,
        required: true
    }

}, {
    timestamps: true
});

// Export schema for tenant-specific database usage
module.exports = ledgerSchema;