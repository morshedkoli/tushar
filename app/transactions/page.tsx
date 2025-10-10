"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Account = { id: number; name: string; type: "BANK" | "MOBILE_BANKING" | "LOAN" | "CASH" };
type Category = { id: number; name: string };

type Tx = {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string | null;
  date: string;
  accountId: number;
  categoryId: number;
  account?: Account;
  category?: Category;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterStart, setFilterStart] = useState<string>("");
  const [filterEnd, setFilterEnd] = useState<string>("");

  const search = useSearchParams();
  useEffect(() => {
    const quick = search.get("quick");
    if (quick === "income") setType("INCOME");
    if (quick === "expense") setType("EXPENSE");
  }, [search]);

  const loadBasics = async () => {
    const [accRes, catRes] = await Promise.all([
      fetch("/api/accounts", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    const [acc, cat] = await Promise.all([accRes.json(), catRes.json()]);
    setAccounts(acc);
    setCategories(cat);
    if (acc.length > 0) setAccountId(String(acc[0].id));
    if (cat.length > 0) setCategoryId(String(cat[0].id));
  };

  const loadTransactions = async () => {
    const qs = new URLSearchParams();
    if (filterType) qs.set("type", filterType);
    if (filterCategory) qs.set("categoryId", filterCategory);
    if (filterAccount) qs.set("accountId", filterAccount);
    if (filterStart) qs.set("start", filterStart);
    if (filterEnd) qs.set("end", filterEnd);
    const res = await fetch(`/api/transactions${qs.toString() ? `?${qs}` : ""}`, { cache: "no-store" });
    setTransactions(await res.json());
  };

  useEffect(() => { loadBasics(); loadTransactions(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount || Number(amount) <= 0) { setError("Amount must be > 0"); return; }
    if (!accountId || !categoryId) { setError("Account and Category required"); return; }
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: Number(amount), description, date, accountId: Number(accountId), categoryId: Number(categoryId) })
    });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || "Failed to add"); return; }
    setAmount(""); setDescription(""); setDate(new Date().toISOString().slice(0, 10));
    loadTransactions();
    loadBasics(); // Reload accounts to reflect updated balances
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Failed to delete"); return; }
    loadTransactions();
    loadBasics(); // Reload accounts to reflect updated balances
  };

  const filteredCount = useMemo(() => transactions.length, [transactions]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 pt-16 lg:pt-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{filteredCount} transaction(s)</p>
        </div>
      </header>

      <form onSubmit={submit} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={type} onChange={(e)=> setType(e.target.value as any)}>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e)=> setAmount(e.target.value)} />
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="Description" value={description} onChange={(e)=> setDescription(e.target.value)} />
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={accountId} onChange={(e)=> setAccountId(e.target.value)}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={categoryId} onChange={(e)=> setCategoryId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3 items-center mt-4">
          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm">
            Add Transaction
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={filterType} onChange={(e)=> setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={filterAccount} onChange={(e)=> setFilterAccount(e.target.value)}>
            <option value="">All Accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={filterCategory} onChange={(e)=> setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" type="date" placeholder="Start Date" value={filterStart} onChange={(e)=> setFilterStart(e.target.value)} />
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" type="date" placeholder="End Date" value={filterEnd} onChange={(e)=> setFilterEnd(e.target.value)} />
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm" onClick={loadTransactions}>
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-4 bg-blue-50 border-b border-blue-100 flex items-start gap-2 sm:gap-3">
          <span className="text-blue-600 text-xs sm:text-sm flex-shrink-0">ℹ️</span>
          <div className="text-[10px] sm:text-xs text-blue-900">
            <p className="font-semibold mb-1">Account Impact Guide:</p>
            <ul className="space-y-0.5 text-blue-800">
              <li>• <strong>Regular Accounts:</strong> Income adds balance (+), Expense subtracts balance (-)</li>
              <li className="hidden sm:list-item">• <strong>Loan Accounts 💳:</strong> Income subtracts loan (repayment), Expense adds to loan (taking loan)</li>
              <li className="sm:hidden">• <strong>Loans 💳:</strong> Income = repayment, Expense = taking loan</li>
            </ul>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">DATE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">TYPE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">AMOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ACCOUNT IMPACT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">DESCRIPTION</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">CATEGORY</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ACCOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const isLoan = t.account?.type === 'LOAN';
                const isIncome = t.type === 'INCOME';
                
                // For regular accounts: INCOME adds, EXPENSE subtracts
                // For loan accounts: INCOME subtracts (loan repayment), EXPENSE adds (taking loan)
                const accountImpact = isLoan 
                  ? (isIncome ? -t.amount : t.amount)
                  : (isIncome ? t.amount : -t.amount);
                
                const impactPositive = accountImpact > 0;
                
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-700">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        t.type === 'INCOME' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {t.type === 'INCOME' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold text-sm ${
                      t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ৳{t.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          impactPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {impactPositive ? '+ ৳' : '- ৳'}{Math.abs(accountImpact).toFixed(2)}
                        </span>
                        {isLoan && (
                          <span className="text-[10px] text-orange-600 font-medium">
                            {isIncome ? '💳 Loan Repayment' : '💳 Loan Taken'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{t.description || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{t.category?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700">{t.account?.name || '-'}</span>
                        {isLoan && <span className="text-xs">💳</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-medium transition-colors" 
                        onClick={()=> remove(t.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td className="px-4 py-12 text-center text-gray-400 text-sm" colSpan={8}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
