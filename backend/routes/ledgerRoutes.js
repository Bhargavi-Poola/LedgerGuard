const express = require('express');
const router = express.Router();

const { getAnalytics } = require('../controllers/analyticsController');

const verifyToken = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const idempotencyMiddleware = require('../middleware/idempotencyMiddleware');

const {
    createCredit,
    createDebit,
    getBalance,
    getTransactions
} = require('../controllers/ledgerController');

// Credit transaction
router.post(
    '/credit',
    verifyToken,
    identifyTenant,
    idempotencyMiddleware,
    createCredit
);

// Debit transaction
router.post(
    '/debit',
    verifyToken,
    identifyTenant,
    idempotencyMiddleware,
    createDebit
);

// Get current balance
router.get(
    '/balance',
    verifyToken,
    identifyTenant,
    getBalance
);

// Get transaction history
router.get(
    '/transactions',
    verifyToken,
    identifyTenant,
    getTransactions
);

// Get Ledger Analytics
router.get(
    '/analytics',
    verifyToken,
    identifyTenant,
    getAnalytics
);

module.exports = router;