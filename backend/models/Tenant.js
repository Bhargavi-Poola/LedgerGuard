const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        databaseName: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ['active', 'suspended'],
            default: 'active'
        },

        monthlyLimit: {
            type: Number,
            required: true,
            default: 10000,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;