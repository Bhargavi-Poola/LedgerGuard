const ledgerSchema = require('../models/Ledger');

// Get Monthly Resource Usage
const getMonthlyUsage = async (req, res) => {
    try {
        // Get tenant-specific Ledger model
        const Ledger = req.tenantConnection.model(
            'Ledger',
            ledgerSchema
        );

        // Get monthly limit from authenticated tenant
        const monthlyLimit = req.tenant.monthlyLimit;

        // Current month date range (IST)
        const now = new Date();

        const istDate = new Date(
            now.toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata'
            })
        );

        const startDate = new Date(
            Date.UTC(
                istDate.getFullYear(),
                istDate.getMonth(),
                1,
                -5,
                -30
            )
        );

        const endDate = new Date(
            Date.UTC(
                istDate.getFullYear(),
                istDate.getMonth() + 1,
                1,
                -5,
                -30
            )
        );

        // Calculate monthly expenditure
        const result = await Ledger.aggregate([
            {
                $match: {
                    type: 'DEBIT',
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpenditure: {
                        $sum: '$amount'
                    },
                    transactionCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const totalExpenditure = Number(
            (result[0]?.totalExpenditure || 0).toFixed(2)
        );

        const remainingLimit = Number(
            Math.max(0, monthlyLimit - totalExpenditure).toFixed(2)
        );

        const usagePercentage = monthlyLimit > 0
            ? Number(
                ((totalExpenditure / monthlyLimit) * 100).toFixed(2)
            )
            : totalExpenditure > 0 ? 100 : 0;

        let status = 'Normal';

        if (usagePercentage >= 100) {
            status = 'Limit Exceeded';
        } else if (usagePercentage >= 80) {
            status = 'Warning';
        }

        return res.status(200).json({
            success: true,
            usage: {
                month: istDate.toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric'
                }),
                monthlyLimit,
                totalExpenditure,
                remainingLimit,
                usagePercentage,
                transactionCount: result[0]?.transactionCount || 0,
                status
            }
        });

    } catch (error) {
        console.error('Monthly Usage Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly usage'
        });
    }
};

module.exports = { getMonthlyUsage };