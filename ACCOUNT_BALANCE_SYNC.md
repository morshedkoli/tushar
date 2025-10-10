# Account Balance Synchronization

## How It Works

Your finance dashboard **automatically adjusts account balances** whenever you create, update, or delete transactions.

### Transaction Operations

1. **Create Transaction** (POST `/api/transactions`)
   - Adds amount to account balance for INCOME transactions
   - Subtracts amount from account balance for EXPENSE transactions

2. **Update Transaction** (PATCH `/api/transactions/[id]`)
   - Reverts the old transaction's effect on the account
   - Applies the new transaction's effect (even if the account changed)

3. **Delete Transaction** (DELETE `/api/transactions/[id]`)
   - Reverts the transaction's effect on the account balance

### Balance Calculation Logic

```typescript
if (transaction.type === "INCOME") {
  account.balance += transaction.amount;
} else if (transaction.type === "EXPENSE") {
  account.balance -= transaction.amount;
}
```

## Verifying Balance Sync

To check if your account balances are correctly synced with transactions:

```powershell
# Install tsx if you haven't already
npm install -g tsx

# Run the balance recalculation script
npx tsx scripts/recalculate-balances.ts
```

This script will:
- Calculate what each account balance should be based on transactions
- Compare it with the current balance
- Update any accounts with incorrect balances
- Show you a report of all changes

## Manual Balance Adjustments

⚠️ **Important**: The Accounts page has manual balance adjustment controls (Add/Subtract/Set Exact Balance). These bypass the transaction system and can cause inconsistencies.

**Best Practice**: Always create transactions instead of manually adjusting balances. This ensures:
- Complete transaction history
- Accurate financial reporting
- Consistent account balances

## Testing the Feature

1. Note your account balance before creating a transaction
2. Create an INCOME transaction for ৳1000
3. Check the account - balance should increase by ৳1000
4. Create an EXPENSE transaction for ৳500
5. Check the account - balance should decrease by ৳500
6. Delete the EXPENSE transaction
7. Check the account - balance should increase back by ৳500

## Implementation Files

- `/app/api/transactions/route.ts` - Create transaction with balance update
- `/app/api/transactions/[id]/route.ts` - Update/Delete transaction with balance sync
- `/prisma/schema.prisma` - Database schema showing Account-Transaction relationship
- `/scripts/recalculate-balances.ts` - Utility to fix any balance inconsistencies
