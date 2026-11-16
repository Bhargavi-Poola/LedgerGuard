const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');

// Protected Dashboard Route
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

module.exports = router;
