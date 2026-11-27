\# Week 3 – Day 3: Monthly Usage Tracking and Spending Limits



\## Objective

To implement monthly expenditure tracking, spending limits, usage percentage calculation, and limit management for tenant organizations.



\## Backend Implementation



\### 1. Tenant Model

\- Added `monthlyLimit` field to the Tenant model.

\- Default monthly spending limit: ₹10,000.

\- Minimum allowed value: 0.



\### 2. Monthly Usage API

\- Created `usageController.js`.

\- Implemented monthly DEBIT transaction aggregation.

\- Calculates total expenditure and transaction count.

\- Calculates remaining spending limit.

\- Calculates monthly usage percentage.

\- Generates usage status:

&#x20; - Normal

&#x20; - Warning

&#x20; - Limit Exceeded



\### 3. Monthly Limit Update API

\- Implemented `updateMonthlyLimit` in tenantController.

\- Added PUT `/api/tenants/limit`.

\- Only tenant administrators can update the monthly limit.

\- Validates the requested limit before saving.



\## Frontend Implementation



\- Added Monthly Resource Usage section.

\- Integrated monthly usage API.

\- Displayed monthly spending limit.

\- Displayed total expenditure and remaining limit.

\- Added usage percentage progress bar.

\- Added warning and limit-exceeded messages.

\- Added monthly spending limit update form.

\- Refreshes dashboard data after transactions and limit updates.



\## Testing Results



| Feature | Result |

|---|---|

| Monthly Usage API | Passed |

| Expenditure Calculation | Passed |

| Remaining Limit Calculation | Passed |

| Usage Percentage | Passed |

| Progress Bar | Passed |

| Monthly Limit Update | Passed |

| Admin Authorization | Backend check implemented |

| Frontend Production Build | Passed |



\## Verified Test Values



\- Monthly Limit: ₹10,000

\- Total Expenditure: ₹3,200

\- Remaining Limit: ₹6,800

\- Usage Percentage: 32%

\- Monthly Debit Transactions: 3

\- Status: Normal



\## Conclusion



Monthly expenditure tracking and spending limit management were successfully integrated into LedgerGuard. The dashboard displays usage information and allows authorized tenant administrators to update the monthly spending limit.

