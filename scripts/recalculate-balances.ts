/**
 * Utility script to recalculate all account balances based on transactions
 * Run this if you suspect account balances are out of sync
 * 
 * Usage: npx tsx scripts/recalculate-balances.ts
 */

import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function recalculateBalances() {
  console.log('🔄 Recalculating account balances...\n');

  const accounts = await prisma.account.findMany({
    include: {
      transactions: true,
    },
  });

  for (const account of accounts) {
    const oldBalance = account.balance;
    
    // Calculate balance from transactions
    let calculatedBalance = 0;
    for (const transaction of account.transactions) {
      if (transaction.type === 'INCOME') {
        calculatedBalance += transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        calculatedBalance -= transaction.amount;
      }
    }

    // Update if different
    if (Math.abs(oldBalance - calculatedBalance) > 0.001) {
      await prisma.account.update({
        where: { id: account.id },
        data: { balance: calculatedBalance },
      });
      
      console.log(`✅ Updated ${account.name}:`);
      console.log(`   Old balance: ৳${oldBalance.toFixed(2)}`);
      console.log(`   New balance: ৳${calculatedBalance.toFixed(2)}`);
      console.log(`   Based on ${account.transactions.length} transaction(s)\n`);
    } else {
      console.log(`✓ ${account.name} is correct: ৳${oldBalance.toFixed(2)}`);
    }
  }

  console.log('\n✨ Balance recalculation complete!');
}

recalculateBalances()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
