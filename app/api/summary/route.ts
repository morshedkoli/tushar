import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [accounts, thisMonthIncome, thisMonthExpense, recentTx] = await Promise.all([
      prisma.account.findMany(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "INCOME",
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "EXPENSE",
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.transaction.findMany({
        orderBy: { date: "desc" },
        take: 10,
        include: { category: true, account: true },
      }),
    ]);

    const totalBank = accounts.filter(a => a.type === "BANK").reduce((s, a) => s + a.balance, 0);
    const totalMobile = accounts.filter(a => a.type === "MOBILE_BANKING").reduce((s, a) => s + a.balance, 0);
    const totalCash = accounts.filter(a => a.type === "CASH").reduce((s, a) => s + a.balance, 0);
    const totalLoan = accounts.filter(a => a.type === "LOAN").reduce((s, a) => s + a.balance, 0);
    const netWorth = totalBank + totalMobile + totalCash - totalLoan;

    return NextResponse.json({
      totals: {
        totalBank,
        totalMobile,
        totalCash,
        totalLoan,
        netWorth,
      },
      monthly: {
        income: thisMonthIncome._sum.amount ?? 0,
        expense: thisMonthExpense._sum.amount ?? 0,
      },
      recent: recentTx,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to compute summary" }, { status: 500 });
  }
}
