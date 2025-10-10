# Transaction Account Impact Display

## Overview

The transactions table now displays how each transaction affects the associated account balance, with special handling for loan accounts.

## Account Impact Logic

### Regular Accounts (Bank, Mobile Banking, Cash)

| Transaction Type | Account Impact | Example |
|-----------------|----------------|---------|
| **INCOME** | ➕ Adds to balance | Salary of ৳10,000 → Account balance +৳10,000 |
| **EXPENSE** | ➖ Subtracts from balance | Shopping of ৳2,000 → Account balance -৳2,000 |

### Loan Accounts 💳

Loan accounts work **inversely** because the balance represents money you owe:

| Transaction Type | Account Impact | Meaning | Example |
|-----------------|----------------|---------|---------|
| **INCOME** | ➖ Subtracts from loan | **Loan Repayment** | Pay ৳5,000 → Loan balance -৳5,000 (you owe less) |
| **EXPENSE** | ➕ Adds to loan | **Loan Taken** | Borrow ৳20,000 → Loan balance +৳20,000 (you owe more) |

## Visual Indicators

### In the Transactions Table

1. **Account Impact Column**: Shows the exact amount added (+) or subtracted (-) from the account
   - Green text with + symbol = Balance increases
   - Red text with - symbol = Balance decreases

2. **Loan Indicators**:
   - 💳 icon next to loan account names
   - "💳 Loan Repayment" label for income transactions on loans
   - "💳 Loan Taken" label for expense transactions on loans

## Examples

### Example 1: Regular Bank Account
```
Type: INCOME
Amount: ৳50,000
Account: City Bank (BANK)
Account Impact: + ৳50,000 (green)
Result: Bank balance increases by ৳50,000
```

### Example 2: Expense from Cash
```
Type: EXPENSE
Amount: ৳1,200
Account: Wallet (CASH)
Account Impact: - ৳1,200 (red)
Result: Cash balance decreases by ৳1,200
```

### Example 3: Loan Repayment
```
Type: INCOME
Amount: ৳10,000
Account: Home Loan (LOAN)
Account Impact: - ৳10,000 (red)
Label: 💳 Loan Repayment
Result: Loan balance decreases by ৳10,000 (you owe ৳10,000 less)
```

### Example 4: Taking a Loan
```
Type: EXPENSE
Amount: ৳100,000
Account: Car Loan (LOAN)
Account Impact: + ৳100,000 (green)
Label: 💳 Loan Taken
Result: Loan balance increases by ৳100,000 (you owe ৳100,000 more)
```

## Understanding Loan Logic

### Why are loans inverted?

In traditional accounting:
- **Asset accounts** (Bank, Cash): Positive balance = money you have
- **Liability accounts** (Loans): Positive balance = money you owe

So when you:
- **Repay a loan** (INCOME from your perspective) → Your loan balance should decrease
- **Take a loan** (EXPENSE you'll need to pay back) → Your loan balance should increase

This matches real-world behavior where:
- Paying off a loan reduces what you owe
- Taking out a loan increases what you owe

## Implementation Details

The impact calculation in the code:

```typescript
const isLoan = account.type === 'LOAN';
const isIncome = transaction.type === 'INCOME';

const accountImpact = isLoan 
  ? (isIncome ? -amount : amount)      // Loan: INCOME subtracts, EXPENSE adds
  : (isIncome ? amount : -amount);     // Regular: INCOME adds, EXPENSE subtracts
```

## Database Sync

The account balance in the database is automatically updated using the same logic when transactions are created, updated, or deleted. See `ACCOUNT_BALANCE_SYNC.md` for details.
