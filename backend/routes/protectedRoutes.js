const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');

// Basic Protected Dashboard Route
router.get('/dashboard', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to LedgerGuard Dashboard!',
        user: {
            userId: req.user.userId,
            tenantId: req.user.tenantId,
            role: req.user.role
        }
    });
});

// Tenant Protected Dashboard Route
router.get(
    '/tenant-dashboard',
    verifyToken,
    identifyTenant,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Tenant identified successfully!',
            tenant: {
                id: req.tenant._id,
                name: req.tenant.name,
                databaseName: req.tenant.databaseName
            }
        });
    }
);

module.exports = router;