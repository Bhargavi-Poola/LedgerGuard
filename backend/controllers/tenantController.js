const Tenant = require('../models/Tenant');
const User = require('../models/User');
const crypto = require('crypto');
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

module.exports = { createTenant };