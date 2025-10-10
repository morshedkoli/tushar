"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Account = { id: number; name: string };
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
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Failed to delete"); return; }
    loadTransactions();
  };

  const filteredCount = useMemo(() => transactions.length, [transactions]);

  return (
    <div className="min-h-screen p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-gray-600 mt-1">Manage your income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{filteredCount} transaction(s)</span>
        </div>
      </header>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
            ➕
          </div>
          <h2 className="text-xl font-bold text-gray-800">Add New Transaction</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <select className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" value={type} onChange={(e)=> setType(e.target.value as any)}>
            <option value="INCOME">↑ Income</option>
            <option value="EXPENSE">↓ Expense</option>
          </select>
          <input className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" step="0.01" placeholder="Amount (৳)" value={amount} onChange={(e)=> setAmount(e.target.value)} />
          <input className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Description (optional)" value={description} onChange={(e)=> setDescription(e.target.value)} />
          <input className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
          <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={accountId} onChange={(e)=> setAccountId(e.target.value)}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={categoryId} onChange={(e)=> setCategoryId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-6 flex gap-3 items-center mt-2">
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
            <span>✓</span> Add Transaction
          </button>
          {error && <span className="text-sm text-red-600 font-medium">{error}</span>}
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
            🔍
          </div>
          <h2 className="text-xl font-bold text-gray-800">Filter Transactions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" value={filterType} onChange={(e)=> setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="INCOME">↑ Income</option>
            <option value="EXPENSE">↓ Expense</option>
          </select>
          <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" value={filterAccount} onChange={(e)=> setFilterAccount(e.target.value)}>
            <option value="">All Accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" value={filterCategory} onChange={(e)=> setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" type="date" placeholder="Start Date" value={filterStart} onChange={(e)=> setFilterStart(e.target.value)} />
          <input className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" type="date" placeholder="End Date" value={filterEnd} onChange={(e)=> setFilterEnd(e.target.value)} />
        </div>
        <div className="flex justify-end items-center mt-4">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2" onClick={loadTransactions}>
            <span>🔍</span> Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
                <th className="p-4 text-left font-semibold text-gray-700">Date</th>
                <th className="p-4 text-left font-semibold text-gray-700">Type</th>
                <th className="p-4 text-left font-semibold text-gray-700">Amount</th>
                <th className="p-4 text-left font-semibold text-gray-700">Description</th>
                <th className="p-4 text-left font-semibold text-gray-700">Category</th>
                <th className="p-4 text-left font-semibold text-gray-700">Account</th>
                <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors">
                  <td className="p-4 text-gray-700 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      t.type === 'INCOME' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                        : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700'
                    }`}>
                      {t.type === 'INCOME' ? '↑ Income' : '↓ Expense'}
                    </span>
                  </td>
                  <td className={`p-4 font-bold text-lg ${
                    t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ৳{t.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-600">{t.description || '-'}</td>
                  <td className="p-4 text-gray-700">{t.category?.name || '-'}</td>
                  <td className="p-4 text-gray-700">{t.account?.name || '-'}</td>
                  <td className="p-4">
                    <button 
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm" 
                      onClick={()=> remove(t.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td className="p-12 text-center" colSpan={7}>
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-6xl">📊</span>
                      <p className="text-gray-500 font-medium">No transactions found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or add a new transaction</p>
                    </div>
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
