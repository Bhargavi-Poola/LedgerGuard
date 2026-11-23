# LedgerGuard – Ledger UI and API Integration

## Date
23 November 2026

## Objective
Integrate the React frontend with the LedgerGuard backend APIs and display real-time ledger information.

## Technologies Used
- React
- TypeScript
- Vite
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Implementation

1. Connected the React login form to the backend authentication API.
2. Stored the JWT authentication token in localStorage.
3. Retrieved available balance using the Ledger Balance API.
4. Retrieved transaction history using the Ledger Transactions API.
5. Implemented CREDIT and DEBIT transaction forms.
6. Added automatic dashboard refresh after successful transactions.
7. Implemented logout functionality.

## API Endpoints Tested

- POST `/api/auth/login`
- GET `/api/ledger/balance`
- GET `/api/ledger/transactions`
- POST `/api/ledger/credit`
- POST `/api/ledger/debit`

## Testing Results

| Test | Result |
|---|---|
| User Login | Passed |
| Dashboard Data Fetch | Passed |
| CREDIT ₹100 | Passed |
| DEBIT ₹200 | Passed |
| Transaction History Refresh | Passed |
| Balance Update | Passed |

## Final Dashboard Values

- Available Balance: ₹7,400
- Total Credits: ₹10,600
- Total Debits: ₹3,200
- Total Transactions: 6

## Conclusion

Successfully integrated the LedgerGuard React frontend with the backend APIs. Login, balance retrieval, transaction history, CREDIT and DEBIT operations were tested successfully.