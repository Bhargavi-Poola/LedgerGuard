const tenantRecordSchema = require('../models/TenantRecord');

// Create a record in the authenticated tenant's database
const createRecord = async (req, res) => {
    try {
        const TenantRecord = req.tenantConnection.model(
            'TenantRecord',
            tenantRecordSchema
        );

        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Record title is required'
            });
        }

        const record = await TenantRecord.create({
            title: title.trim(),
            description
        });

        return res.status(201).json({
            success: true,
            message: 'Tenant record created successfully',
            record
        });

    } catch (error) {
        console.error('Create Record Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to create tenant record'
        });
    }
};

// Get records from the authenticated tenant's database
const getRecords = async (req, res) => {
    try {
        const TenantRecord = req.tenantConnection.model(
            'TenantRecord',
            tenantRecordSchema
        );

        const records = await TenantRecord.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            message: 'Tenant records fetched successfully',
            records
        });

    } catch (error) {
        console.error('Get Records Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch tenant records'
        });
    }
};

module.exports = {
    createRecord,
    getRecords
};