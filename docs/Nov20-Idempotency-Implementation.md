# Unique Event IDs and Idempotency Implementation

## 1. Objective
To implement unique Event IDs and idempotency in LedgerGuard to prevent duplicate billing requests and ensure reliable request processing.

## 2. Technologies Used
- Node.js
- Express.js
- Redis
- Upstash Redis
- JavaScript
- Node.js Crypto Module

## 3. Implementation Details

1. Generated unique Event IDs using the Node.js Crypto module and UUID.
2. Created an idempotency middleware to validate Event IDs.
3. Used Redis to store and check Event IDs.
4. Implemented atomic Redis SET NX EX operations to prevent duplicate requests.
5. Used tenant-specific Redis keys to maintain tenant-level isolation.
6. Configured automatic Event ID expiration using Redis TTL.

## 4. Testing Results

| Test Case | Result |
|---|---|
| Unique Event ID generation | PASSED |
| Redis Event ID storage | PASSED |
| Duplicate request detection | PASSED |
| Duplicate request prevention | PASSED |
| Concurrent requests (5 requests) | PASSED |
| Automatic Event ID expiration | PASSED |

## 5. Concurrent Testing

Five simultaneous requests were sent using the same Event ID.

- Total requests: 5
- Successful requests: 1
- Duplicate requests blocked: 4

The test confirmed that Redis atomic operations prevent multiple requests from reserving the same Event ID.

## 6. Conclusion

Unique Event ID generation and Redis-based idempotency reservation were successfully implemented and tested in LedgerGuard. Duplicate and concurrent requests using the same Event ID were prevented, and automatic expiration was verified.