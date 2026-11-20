const { redisClient } = require('../config/redis');

async function idempotencyMiddleware(req, res, next) {
    try {
        const eventId = req.headers['x-event-id'];

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        if (!req.user || !req.user.tenantId) {
            return res.status(401).json({
                success: false,
                message: 'Authenticated tenant information is missing'
            });
        }

        const key = `idempotency:${req.user.tenantId}:${eventId}`;

        // Atomically reserve the Event ID in Redis
        const result = await redisClient.set(
            key,
            'processing',
            {
                NX: true,
                EX: 86400
            }
        );

        if (result !== 'OK') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate request detected',
                eventId
            });
        }

        req.eventId = eventId;
        req.idempotencyKey = key;

        next();

    } catch (error) {
        console.error('Idempotency Middleware Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Idempotency check failed'
        });
    }
}

module.exports = idempotencyMiddleware;