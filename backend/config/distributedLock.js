const { randomUUID } = require('crypto');
const { redisClient } = require('./redis');

// Acquire Distributed Lock
async function acquireLock(resource, ttl = 10000) {
    const lockKey = `lock:${resource}`;
    const lockId = randomUUID();

    const result = await redisClient.set(
        lockKey,
        lockId,
        {
            NX: true,
            PX: ttl
        }
    );

    if (result === 'OK') {
        console.log(`Lock acquired: ${resource}`);

        return {
            lockKey,
            lockId
        };
    }

    console.log(`Resource already locked: ${resource}`);

    return null;
}

// Release Distributed Lock
async function releaseLock(lock) {
    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `;

    const result = await redisClient.eval(script, {
        keys: [lock.lockKey],
        arguments: [lock.lockId]
    });

    if (result === 1) {
        console.log('Lock released successfully!');
        return true;
    }

    console.log('Lock release failed: ownership mismatch or expired lock');
    return false;
}

module.exports = {
    acquireLock,
    releaseLock
};