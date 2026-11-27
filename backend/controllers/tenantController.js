const Tenant = require('../models/Tenant');
const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');
// Create a new tenant organization
const createTenant = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate organization name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Organization name is required'
            });
        }

        // Only users without an existing tenant can create one
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.tenantId) {
            return res.status(409).json({
                success: false,
                message: 'User already belongs to an organization'
            });
        }

        // Generate a safe unique slug
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid organization name'
            });
        }

        const existingTenant = await Tenant.findOne({ slug });

        if (existingTenant) {
            return res.status(409).json({
                success: false,
                message: 'Organization already exists'
            });
        }

        // Generate database name on the server
        const databaseName = `lg_t_${crypto.randomBytes(5).toString('hex')}`;
        // Create tenant
        const tenant = await Tenant.create({
            name: name.trim(),
            slug,
            databaseName
        });

        // Assign tenant to the authenticated user
        user.tenantId = tenant._id;
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            tenant: {
                id: tenant._id,
                name: tenant.name,
                slug: tenant.slug,
                databaseName: tenant.databaseName
            }
        });

    } catch (error) {
        console.error('Tenant Creation Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to create organization'
        });
    }
};
// Update Monthly Spending Limit
const updateMonthlyLimit = async (req, res) => {
    try {
        const { monthlyLimit } = req.body;

        // Validate monthly limit
        if (
            monthlyLimit === undefined ||
            typeof monthlyLimit !== 'number' ||
            !Number.isFinite(monthlyLimit) ||
            monthlyLimit < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid monthly limit'
            });
        }

        // Verify current user from database
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only admin can update limit
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can update monthly limit'
            });
        }

        // Verify authenticated tenant association
        if (
            !user.tenantId ||
            user.tenantId.toString() !== req.tenant._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Tenant access denied'
            });
        }

        // Update tenant limit
        req.tenant.monthlyLimit = monthlyLimit;
        await req.tenant.save();

        return res.status(200).json({
            success: true,
            message: 'Monthly limit updated successfully',
            monthlyLimit: req.tenant.monthlyLimit
        });

    } catch (error) {
        console.error('Monthly Limit Update Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to update monthly limit'
        });
    }
};
module.exports = {
    createTenant,
    updateMonthlyLimit
};