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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:p-8">
      <Link href="/people" className="group mb-5 inline-flex items-center gap-2 font-medium text-indigo-600 transition-all hover:text-indigo-800 sm:mb-8">
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to People
      </Link>

      <div className="mb-5 rounded-3xl border border-white/20 bg-white/70 p-5 shadow-2xl backdrop-blur-xl dark:bg-gray-800/70 sm:mb-8 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:gap-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-2xl font-bold text-indigo-600 shadow-inner dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-400 sm:h-20 sm:w-20 sm:text-3xl">
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="mb-1 truncate text-3xl font-extrabold text-gray-900 dark:text-white sm:mb-2 sm:text-4xl">{person.name}</h1>
              {person.phone && <p className="text-gray-500 flex items-center gap-2">📞 {person.phone}</p>}
            </div>
          </div>
          
          <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-left dark:border-gray-700 dark:bg-gray-900/50 sm:p-6 md:min-w-[250px] md:text-right">
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Current Balance</p>
            <p className={`mb-2 break-words text-4xl font-black leading-tight sm:text-5xl ${
              person.balance > 0 ? "text-green-600" : person.balance < 0 ? "text-red-600" : "text-gray-900 dark:text-white"
            }`}>
              ৳{Math.abs(person.balance).toLocaleString()}
            </p>
            <p className={`text-sm font-bold ${
              person.balance > 0 ? "text-green-700" : person.balance < 0 ? "text-red-700" : "text-gray-500"
            }`}>
              {person.balance > 0 ? "You Owe Them" : person.balance < 0 ? "They Owe You" : "All Settled"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 dark:border-gray-700 sm:mt-8 sm:grid-cols-2 sm:gap-4 sm:pt-8">
          <button
            onClick={() => { setTxType("ADD"); setShowTxModal(true); }}
            className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-green-200 bg-green-50 py-4 text-base font-bold text-green-700 shadow-sm transition-colors hover:border-green-300 hover:bg-green-100 sm:text-lg"
          >
            <span className="text-2xl">+</span> Add Amount
          </button>
          <button
            onClick={() => { setTxType("DEDUCT"); setShowTxModal(true); }}
            className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-4 text-base font-bold text-red-700 shadow-sm transition-colors hover:border-red-300 hover:bg-red-100 sm:text-lg"
          >
            <span className="text-2xl">-</span> Deduct Amount
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:bg-gray-800/70 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Transaction History</h2>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline">
            Delete Person
          </button>
        </div>
        
        {person.transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {person.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50 sm:p-5">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-lg">{tx.description || "No description"}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-xl font-black sm:text-2xl ${tx.type === "ADD" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "ADD" ? "+" : "-"} ৳{tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTxModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl transition-all dark:bg-gray-900 sm:p-8">
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${
              txType === 'ADD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {txType === 'ADD' ? 'Add Amount' : 'Deduct Amount'}
            </div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {txType === 'ADD' ? "Add to Balance" : "Deduct from Balance"}
            </h2>
            <form onSubmit={handleTransaction}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                    <input
                      id="transaction-amount"
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-xl font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="transaction-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Optional)</label>
                  <input
                    id="transaction-note"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="What was this for?"
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-4 rounded-xl font-bold transition-colors shadow-lg text-white ${
                    txType === 'ADD' 
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                      : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  } ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
