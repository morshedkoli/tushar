import prisma from "@/lib/prisma";

// Force dynamic rendering to avoid database access at build time
export const dynamic = 'force-dynamic';

async function getSummary() {
  try {
    const [accounts, thisMonthIncome, thisMonthExpense, recentTx, receivableOpen, payableOpen] = await Promise.all([
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
      prisma.due.aggregate({ _sum: { amount: true }, where: { status: "OPEN", type: "RECEIVABLE" } }),
      prisma.due.aggregate({ _sum: { amount: true }, where: { status: "OPEN", type: "PAYABLE" } }),
    ]);

    const totalBank = accounts.filter(a => a.type === "BANK").reduce((s: number, a: { balance: number }) => s + a.balance, 0);
    const totalMobile = accounts.filter(a => a.type === "MOBILE_BANKING").reduce((s: number, a: { balance: number }) => s + a.balance, 0);
    const totalCash = accounts.filter(a => a.type === "CASH").reduce((s: number, a: { balance: number }) => s + a.balance, 0);
    const totalLoan = accounts.filter(a => a.type === "LOAN").reduce((s: number, a: { balance: number }) => s + a.balance, 0);
    const netWorth = totalBank + totalMobile + totalCash - totalLoan;

    return {
      totals: {
        totalBank,
        totalMobile,
        totalCash,
        totalLoan,
        netWorth,
        receivableOpen: receivableOpen._sum.amount ?? 0,
        payableOpen: payableOpen._sum.amount ?? 0,
      },
      monthly: {
        income: thisMonthIncome._sum.amount ?? 0,
        expense: thisMonthExpense._sum.amount ?? 0,
      },
      recent: recentTx,
    };
  } catch (error) {
    console.error("Failed to get summary:", error);
    return null;
  }
}

export default async function Home() {
  const summary = await getSummary();
  const totals = summary?.totals || { totalBank: 0, totalMobile: 0, totalCash: 0, totalLoan: 0, netWorth: 0, receivableOpen: 0, payableOpen: 0 };
  const monthly = summary?.monthly || { income: 0, expense: 0 };
  const recent = summary?.recent || [];

  // Compute monthly progress distribution (income vs expense)
  const income = monthly.income;
  const expense = monthly.expense;
  const totalFlow = income + expense;
  const incomePct = totalFlow > 0 ? Math.round((income / totalFlow) * 100) : 0;
  const expensePct = totalFlow > 0 ? 100 - incomePct : 0;

  return (
    <div className="min-h-screen p-0 sm:p-0 lg:p-0 pt-16 lg:pt-8">
      {/* Hero header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white p-6 sm:p-8 shadow-sm border border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-xl border border-white/10">
              <div className="text-xs text-gray-300">Net Worth</div>
              <div className="text-2xl font-extrabold">৳{totals.netWorth.toFixed(2)}</div>
            </div>
          </div>
          {/* Monthly progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
              <span>Monthly Flow</span>
              <span>
                <span className="text-green-300 mr-3">Income: ৳{income.toFixed(2)}</span>
                <span className="text-red-300">Expense: ৳{expense.toFixed(2)}</span>
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-3 bg-green-400" style={{ width: `${incomePct}%` }} />
              <div className="h-3 bg-red-400 -mt-3" style={{ width: `${expensePct}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1">
              <span>{incomePct}% Income</span>
              <span>{expensePct}% Expense</span>
            </div>
          </div>
          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="/transactions?quick=income" className="px-3 py-2 rounded-lg bg-green-500/10 text-green-200 border border-green-500/20 text-xs hover:bg-green-500/20">+ Add Income</a>
            <a href="/transactions?quick=expense" className="px-3 py-2 rounded-lg bg-red-500/10 text-red-200 border border-red-500/20 text-xs hover:bg-red-500/20">- Add Expense</a>
            <a href="/receivables" className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 text-xs hover:bg-emerald-500/20">↗ Receivables</a>
            <a href="/payables" className="px-3 py-2 rounded-lg bg-orange-500/10 text-orange-200 border border-orange-500/20 text-xs hover:bg-orange-500/20">↘ Payables</a>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <section className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><span className="text-xl">🏦</span><span className="text-sm text-gray-600">Bank</span></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">৳{totals.totalBank.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">📱</span><span className="text-sm text-gray-600">Mobile</span></div>
          <div className="text-2xl font-bold text-gray-900">৳{totals.totalMobile.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">💵</span><span className="text-sm text-gray-600">Cash</span></div>
          <div className="text-2xl font-bold text-gray-900">৳{totals.totalCash.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">💳</span><span className="text-sm text-gray-600">Loans</span></div>
          <div className="text-2xl font-bold text-red-600">৳{totals.totalLoan.toFixed(2)}</div>
        </div>

        <a href="/receivables" className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🤝</span><span className="text-sm text-gray-600">Receivables</span></div>
          <div className="text-2xl font-bold text-emerald-600">৳{totals.receivableOpen.toFixed(2)}</div>
        </a>

        <a href="/payables" className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🧾</span><span className="text-sm text-gray-600">Payables</span></div>
          <div className="text-2xl font-bold text-orange-600">৳{totals.payableOpen.toFixed(2)}</div>
        </a>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <a 
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors" 
              href="/transactions"
            >
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 px-2 text-xs font-medium text-gray-500">DATE</th>
                  <th className="py-2 px-2 text-xs font-medium text-gray-500">TYPE</th>
                  <th className="py-2 px-2 text-xs font-medium text-gray-500">AMOUNT</th>
                  <th className="py-2 px-2 text-xs font-medium text-gray-500">CATEGORY</th>
                  <th className="py-2 px-2 text-xs font-medium text-gray-500">ACCOUNT</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-gray-400 text-sm">No transactions yet</p>
                    </td>
                  </tr>
                )}
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 text-gray-700 text-xs">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        t.type === 'INCOME' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {t.type === 'INCOME' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className={`py-3 px-2 font-semibold text-sm ${
                      t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ৳{t.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-gray-700 text-xs">{t.category?.name || '-'}</td>
                    <td className="py-3 px-2 text-gray-700 text-xs">{t.account?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h2>

          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700">INCOME</span>
                <span className="text-lg font-bold text-green-700">৳{monthly.income.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-red-700">EXPENSE</span>
                <span className="text-lg font-bold text-red-700">৳{monthly.expense.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">BALANCE</span>
                <span className="text-lg font-bold text-gray-900">
                  ৳{(monthly.income - monthly.expense).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <a 
              className="block w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-center transition-colors text-sm" 
              href="/transactions?quick=income"
            >
              + Add Income
            </a>
            <a 
              className="block w-full px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg font-medium text-center transition-colors text-sm" 
              href="/transactions?quick=expense"
            >
              - Add Expense
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
