const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');

const {
    createTenant,
    updateMonthlyLimit
} = require('../controllers/tenantController');

// Create Organization
router.post(
    '/create',
    verifyToken,
    createTenant
);

// Update Monthly Spending Limit
router.put(
    '/limit',
    verifyToken,
    identifyTenant,
    updateMonthlyLimit
);

module.exports = router;