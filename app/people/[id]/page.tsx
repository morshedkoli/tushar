"use client";
import { useEffect, useState } from "react";
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

  const fetchPerson = async () => {
    setLoading(true);
    const res = await fetch(`/api/people/${resolvedParams.id}`);
    if (res.ok) {
      setPerson(await res.json());
    } else {
      router.push("/people");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPerson();
  }, [resolvedParams.id]);

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
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/people" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 font-medium gap-2 group transition-all">
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to People
      </Link>

      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 shadow-inner">
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{person.name}</h1>
              {person.phone && <p className="text-gray-500 flex items-center gap-2">📞 {person.phone}</p>}
            </div>
          </div>
          
          <div className="text-right bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 min-w-[250px]">
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Current Balance</p>
            <p className={`text-5xl font-black mb-2 ${
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

        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => { setTxType("ADD"); setShowTxModal(true); }}
            className="flex items-center justify-center gap-3 bg-green-50 hover:bg-green-100 text-green-700 py-4 rounded-2xl font-bold text-lg transition-colors border border-green-200 hover:border-green-300 shadow-sm"
          >
            <span className="text-2xl">+</span> Add Amount
          </button>
          <button
            onClick={() => { setTxType("DEDUCT"); setShowTxModal(true); }}
            className="flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-700 py-4 rounded-2xl font-bold text-lg transition-colors border border-red-200 hover:border-red-300 shadow-sm"
          >
            <span className="text-2xl">-</span> Deduct Amount
          </button>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline">
            Delete Person
          </button>
        </div>
        
        {person.transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {person.transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{tx.description || "No description"}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${tx.type === "ADD" ? "text-green-600" : "text-red-600"}`}>
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
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                    <input
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="What was this for?"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
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
