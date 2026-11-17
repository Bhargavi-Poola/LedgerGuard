const mongoose = require('mongoose');

const tenantRecordSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = tenantRecordSchema;