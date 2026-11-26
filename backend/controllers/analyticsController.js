const ledgerSchema = require('../models/Ledger');

// Get Ledger Analytics with Date Range Filter
const getAnalytics = async (req, res) => {
    try {
        const Ledger = req.tenantConnection.model(
            'Ledger',
            ledgerSchema
        );

        const { startDate, endDate } = req.query;

        // Build date filter
        const matchStage = {};

        if (startDate || endDate) {
            matchStage.createdAt = {};

            if (startDate) {
                const start = new Date(`${startDate}T00:00:00.000+05:30`);

                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid startDate'
                    });
                }

                matchStage.createdAt.$gte = start;
            }

            if (endDate) {
                const end = new Date(`${endDate}T23:59:59.999+05:30`);

                if (isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid endDate'
                    });
                }

                matchStage.createdAt.$lte = end;
            }

            if (
                startDate &&
                endDate &&
                new Date(startDate) > new Date(endDate)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate must be before endDate'
                });
            }
        }

        // MongoDB Aggregation Pipeline
        const result = await Ledger.aggregate([
            ...(Object.keys(matchStage).length
                ? [{ $match: matchStage }]
                : []),

            {
                $facet: {
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

                                totalTransactions: { $sum: 1 }
                            }
                        }
                    ],

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

                                transactionCount: { $sum: 1 }
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

            filters: {
                startDate: startDate || null,
                endDate: endDate || null
            },

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