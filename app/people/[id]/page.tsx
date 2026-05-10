"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

interface Transaction {
  id: number;
  amount: number;
  type: "ADD" | "DEDUCT";
  description: string | null;
  date: string;
}

interface Person {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
  transactions: Transaction[];
}

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<"ADD" | "DEDUCT">("ADD");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPerson = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/people/${resolvedParams.id}`);
    if (res.ok) {
      setPerson(await res.json());
    } else {
      router.push("/people");
    }
    setLoading(false);
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchPerson();
  }, [fetchPerson]);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setSubmitting(true);
    await fetch(`/api/people/${resolvedParams.id}/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        type: txType,
        description,
      }),
    });
    
    setAmount("");
    setDescription("");
    setShowTxModal(false);
    setSubmitting(false);
    fetchPerson();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this person and all their history?")) {
      await fetch(`/api/people/${resolvedParams.id}`, { method: "DELETE" });
      router.push("/people");
    }
  };

  if (loading || !person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-30"></div>
          <div className="relative h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/people" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
        ← Back to People
      </Link>

      <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80 sm:p-7">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-xl font-bold text-indigo-600 shadow-inner dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-400">
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{person.name}</h1>
              {person.phone && <p className="text-gray-500 dark:text-gray-400">📞 {person.phone}</p>}
            </div>
          </div>
          
          <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-left dark:border-gray-800 dark:bg-gray-900/50 sm:min-w-[200px] sm:text-right sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Current Balance</p>
            <p className={`break-words text-3xl font-bold sm:text-4xl ${
              person.balance > 0 ? "text-green-600" : person.balance < 0 ? "text-red-600" : "text-gray-900 dark:text-white"
            }`}>
              ৳{Math.abs(person.balance).toLocaleString()}
            </p>
            <p className={`mt-1 text-sm font-semibold ${
              person.balance > 0 ? "text-green-700" : person.balance < 0 ? "text-red-700" : "text-gray-500"
            }`}>
              {person.balance > 0 ? "You Owe Them" : person.balance < 0 ? "They Owe You" : "All Settled"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:mt-6 sm:grid-cols-2">
          <button
            onClick={() => { setTxType("ADD"); setShowTxModal(true); }}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm transition-all duration-200 hover:bg-green-100 hover:shadow-md"
          >
            <span className="text-lg">+</span> Add Amount
          </button>
          <button
            onClick={() => { setTxType("DEDUCT"); setShowTxModal(true); }}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 hover:shadow-md"
          >
            <span className="text-lg">-</span> Deduct Amount
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Transaction History</h2>
          <button onClick={handleDelete} className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline">
            Delete Person
          </button>
        </div>
        
        {person.transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {person.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition-shadow duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{tx.description || "No description"}</p>
                  <p className="mt-1 text-sm text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-lg font-bold ${tx.type === "ADD" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "ADD" ? "+" : "-"} ৳{tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-7">
            <div className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              txType === 'ADD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {txType === 'ADD' ? 'Add Amount' : 'Deduct Amount'}
            </div>
            <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
              {txType === 'ADD' ? "Add to Balance" : "Deduct from Balance"}
            </h2>
            <form onSubmit={handleTransaction}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="transaction-amount" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">৳</span>
                    <input
                      id="transaction-amount"
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3.5 pl-10 pr-4 text-lg font-bold text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="transaction-note" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note (Optional)
                  </label>
                  <input
                    id="transaction-note"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 text-base text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="What was this for?"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3.5 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                    txType === 'ADD' 
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-500/25' 
                      : 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                  } ${submitting ? 'opacity-70' : ''}`}
                >
                  {submitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}