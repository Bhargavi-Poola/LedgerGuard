const ledgerSchema = require('../models/Ledger');

// Get Ledger Analytics
const getAnalytics = async (req, res) => {
    try {
        // Get tenant-specific Ledger model
        const Ledger = req.tenantConnection.model(
            'Ledger',
            ledgerSchema
        );

        // MongoDB Aggregation Pipeline
        const result = await Ledger.aggregate([

            {
                $facet: {

                    // Overall financial summary
                    summary: [
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
                                },

                                totalTransactions: {
                                    $sum: 1
                                }
                            }
                        }
                    ],

                    // Monthly financial statistics
                    monthly: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%Y-%m',
                                        date: '$createdAt',
                                        timezone: 'Asia/Kolkata'
                                    }
                                },

                                credits: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ['$type', 'CREDIT'] },
                                            '$amount',
                                            0
                                        ]
                                    }
                                },

                                debits: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ['$type', 'DEBIT'] },
                                            '$amount',
                                            0
                                        ]
                                    }
                                },

                                transactionCount: {
                                    $sum: 1
                                }
                            }
                        },

                        { $sort: { _id: 1 } }
                    ]

                }
            }

        ]);

        const summary = result[0].summary[0] || {
            totalCredits: 0,
            totalDebits: 0,
            totalTransactions: 0
        };

        return res.status(200).json({
            success: true,

            analytics: {
                totalCredits: Number(summary.totalCredits.toFixed(2)),
                totalDebits: Number(summary.totalDebits.toFixed(2)),

                balance: Number(
                    (summary.totalCredits - summary.totalDebits).toFixed(2)
                ),

                totalTransactions: summary.totalTransactions,

                monthly: result[0].monthly
            }
        });

    } catch (error) {

        console.error('Analytics Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });

    }
};

module.exports = { getAnalytics };