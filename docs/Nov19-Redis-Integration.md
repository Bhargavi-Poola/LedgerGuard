# Redis Integration and Distributed Locks

## Objective
To integrate Redis into LedgerGuard and implement distributed locking to prevent simultaneous operations on shared billing resources.

## Technologies Used
- Node.js
- Express.js
- Redis
- Upstash Redis
- JavaScript

## Implementation Details

1. Installed the Redis npm package.
2. Created an Upstash Redis database in the Mumbai AWS region.
3. Configured Redis connection using environment variables.
4. Integrated Redis with the Express backend.
5. Implemented distributed lock acquisition using Redis SET NX with expiration.
6. Implemented safe lock release using unique lock IDs and Lua scripting.
7. Added automatic lock expiration using TTL.

## Testing Results

| Test Case | Result |
|---|---|
| Redis connection | PASSED |
| Redis read/write operations | PASSED |
| Lock acquisition | PASSED |
| Duplicate lock prevention | PASSED |
| Lock release | PASSED |
| Concurrent requests (5 requests) | PASSED |
| Automatic lock expiration | PASSED |
| Unauthorized lock release prevention | PASSED |

## Conclusion

Redis was successfully integrated with the LedgerGuard backend. Distributed locks were implemented and tested to prevent conflicting simultaneous operations. All eight test categories passed successfully.