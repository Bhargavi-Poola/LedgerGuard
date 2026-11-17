const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const { createTenant } = require('../controllers/tenantController');

// Create Organization
router.post('/create', verifyToken, createTenant);

module.exports = router;