# MongoDB Transactions Implementation

**Project:** LedgerGuard – Dynamic Multi-Tenant Zero-Knowledge Billing Engine  
**Date:** November 22, 2026

## 1. Objective

Implemented MongoDB transactions to ensure atomicity and data consistency during CREDIT and DEBIT operations in the LedgerGuard application.

## 2. Concepts Implemented

- MongoDB sessions
- Transaction initialization
- Atomic database operations
- Transaction commit
- Transaction rollback
- Balance validation
- Data consistency verification

## 3. Implementation Details

### MongoDB Session Setup
- Created MongoDB sessions using the tenant-specific database connection.
- Started transactions using `session.startTransaction()`.
- Ensured database operations use the same session.

### CREDIT Transaction
- Validated the transaction amount and description.
- Acquired a distributed lock.
- Started a MongoDB transaction.
- Inserted the CREDIT record within the transaction.
- Calculated the updated balance.
- Committed the transaction using `session.commitTransaction()`.

### DEBIT Transaction
- Validated the transaction details.
- Started a MongoDB transaction.
- Retrieved the current balance within the session.
- Checked whether sufficient balance was available.
- Inserted the DEBIT record if the balance was sufficient.
- Committed the transaction successfully.

### Rollback Handling
- Used `session.abortTransaction()` when a transaction could not be completed.
- Rejected debit requests with insufficient funds.
- Ended the MongoDB session and released the distributed lock.

## 4. Testing and Results

| Test Case | Expected Result | Actual Result |
|---|---|---|
| MongoDB session creation | Successful | Passed |
| CREDIT ₹500 | Transaction committed | Passed |
| DEBIT ₹1,000 | Transaction committed | Passed |
| DEBIT ₹99,999 | Insufficient balance | Passed |
| Balance verification | Balance unchanged after failure | Passed |
| Transaction history | Failed debit not saved | Passed |

## 5. Final Balance Verification

| Description | Amount |
|---|---:|
| Total Credits | ₹10,500 |
| Total Debits | ₹3,000 |
| Available Balance | ₹7,500 |

Total successful transactions: **4**

The failed ₹99,999 debit