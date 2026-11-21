# November 21 – Ledger Model and Debit/Credit APIs

## Objective
To implement the Ledger Model and develop secure CREDIT and DEBIT transaction APIs with balance calculation and transaction history.

## Implementation

1. Created the Ledger Model using Mongoose.
2. Implemented CREDIT API to add funds to a tenant's ledger.
3. Implemented DEBIT API to deduct funds from a tenant's ledger.
4. Implemented balance calculation using MongoDB aggregation.
5. Developed an API to retrieve transaction history.
6. Integrated Redis distributed locks to prevent simultaneous ledger updates.
7. Integrated Event ID-based duplicate request prevention.
8. Added input validation for transaction amounts and descriptions.
9. Implemented insufficient balance validation to prevent invalid debits.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/ledger/credit | Create a credit transaction |
| POST | /api/ledger/debit | Create a debit transaction |
| GET | /api/ledger/balance | Retrieve current balance |
| GET | /api/ledger/transactions | Retrieve transaction history |

## Testing Results

| Test Case | Expected Result | Status |
|---|---|---|
| Initial balance | ₹0 | Passed |
| Credit ₹10,000 | Balance ₹10,000 | Passed |
| Debit ₹2,000 | Balance ₹8,000 | Passed |
| Debit ₹9,000 | Insufficient balance error | Passed |
| Transaction history | Two successful transactions | Passed |
| Duplicate debit request | Duplicate request rejected | Passed |
| Final balance verification | ₹8,000 | Passed |

## Final Result

Successfully implemented and tested the Ledger Model, CREDIT and DEBIT APIs, balance calculation, transaction history, distributed locking, and duplicate request prevention.

The final verified ledger balance is ₹8,000.

## Next Day Plan – November 22

- Implement MongoDB transactions.
- Ensure atomic ledger operations.
- Test transaction rollback scenarios.
- Verify data consistency during failed transactions.