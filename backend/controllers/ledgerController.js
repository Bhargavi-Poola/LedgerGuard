const { randomUUID } = require('crypto');

const ledgerSchema = require('../models/Ledger');
const { acquireLock, releaseLock } = require('../config/distributedLock');

// Calculate current balance
async function calculateBalance(Ledger) {
    const result = await Ledger.aggregate([
        {
            $group: {
                _id: null,

                totalCredits: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'CREDIT'] },
                            '$amount',
                            0
                        ]
                    }
                },

                totalDebits: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'DEBIT'] },
                            '$amount',
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const credits = result[0]?.totalCredits || 0;
    const debits = result[0]?.totalDebits || 0;

    return {
        totalCredits: Number(credits.toFixed(2)),
        totalDebits: Number(debits.toFixed(2)),
        balance: Number((credits - debits).toFixed(2))
    };
}

// Create Credit or Debit Transaction
async function createTransaction(req, res, type) {
    let lock = null;

    try {
        const { amount, description } = req.body;

        if (!req.user || !req.user.tenantId) {
            return res.status(401).json({
                success: false,
                message: 'Authenticated tenant information is missing'
            });
        }

        if (
            typeof amount !== 'number' ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            Math.round(amount * 100) !== amount * 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number with up to 2 decimal places'
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Transaction description is required'
            });
        }

        const Ledger = req.tenantConnection.model(
            'Ledger',
            ledgerSchema
        );

        // Prevent simultaneous balance updates for this tenant
        lock = await acquireLock(`ledger:${req.user.tenantId}`);

        if (!lock) {
            return res.status(409).json({
                success: false,
                message: 'Another transaction is being processed. Please try again.'
            });
        }

        const current = await calculateBalance(Ledger);

        if (type === 'DEBIT' && current.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance',
                currentBalance: current.balance
            });
        }

        const transaction = await Ledger.create({
            transactionId: `txn_${randomUUID()}`,
            tenantId: req.user.tenantId,
            eventId: req.eventId || `evt_${randomUUID()}`,
            type,
            amount,
            description: description.trim()
        });

        const updated = await calculateBalance(Ledger);

        return res.status(201).json({
            success: true,
            message: `${type} transaction created successfully`,
            transaction,
            balance: updated.balance
        });

    } catch (error) {
        console.error('Ledger Transaction Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to process ledger transaction'
        });

    } finally {
        if (lock) {
            try {
                await releaseLock(lock);
            } catch (error) {
                console.error('Lock Release Error:', error.message);
            }
        }
    }
}

// Credit API
const createCredit = (req, res) => {
    return createTransaction(req, res, 'CREDIT');
};

// Debit API
const createDebit = (req, res) => {
    return createTransaction(req, res, 'DEBIT');
};

// Get Current Balance
const getBalance = async (req, res) => {
    try {
        const Ledger = req.tenantConnection.model(
            'Ledger',
            ledgerSchema
        );

        const balance = await calculateBalance(Ledger);

        return res.status(200).json({
            success: true,
            balance
        });

    } catch (error) {
        console.error('Get Balance Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch balance'
        });
    }
};

// Get Transaction History
const getTransactions = async (req, res) => {
    try {
        const Ledger = req.tenantConnection.model(
            'Ledger',
            ledgerSchema
        );

        const transactions = await Ledger.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('Get Transactions Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions'
        });
    }
};

module.exports = {
    createCredit,
    createDebit,
    getBalance,
    getTransactions
};