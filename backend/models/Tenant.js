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
        }
    },
    {
        timestamps: true
    }
);

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;