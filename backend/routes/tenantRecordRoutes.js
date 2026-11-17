const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');

const {
    createRecord,
    getRecords
} = require('../controllers/tenantRecordController');

// Create tenant-specific record
router.post('/', verifyToken, identifyTenant, createRecord);

// Get tenant-specific records
router.get('/', verifyToken, identifyTenant, getRecords);

module.exports = router;