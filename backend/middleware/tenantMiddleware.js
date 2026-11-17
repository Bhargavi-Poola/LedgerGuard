const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const getTenantConnection = require('../config/tenantDb');

// Identify and connect the authenticated user's tenant
const identifyTenant = async (req, res, next) => {
    try {
        // Get tenant ID from verified JWT
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            return res.status(403).json({
                success: false,
                message: 'User is not associated with any tenant'
            });
        }

        // Validate tenant ID
        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tenant ID'
            });
        }

        // Find tenant in the main database
        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found'
            });
        }

        // Check tenant status
        if (tenant.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Tenant account is inactive'
            });
        }

        // Connect to the tenant database
        const tenantConnection = await getTenantConnection(
            tenant.databaseName
        );

        // Attach tenant details to request
        req.tenant = tenant;
        req.tenantConnection = tenantConnection;

        next();

    } catch (error) {
        console.error('Tenant Identification Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to identify tenant'
        });
    }
};

module.exports = identifyTenant;