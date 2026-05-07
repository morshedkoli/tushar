"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Person {
  id: number;
  name: string;
  phone?: string | null;
  balance: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: "ADD" | "DEDUCT";
  description: string | null;
  date: string;
  person: Person;
}

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [peopleRes, txRes] = await Promise.all([
          fetch("/api/people"),
          // Let's create an endpoint for recent transactions, or just use the UI without it if it fails.
          // Wait, we don't have a global transactions endpoint yet. Let's create it.
          fetch("/api/summary")
        ]);
        
        if (peopleRes.ok) {
          const pData = await peopleRes.json();
          setPeople(pData);
        }
        
        if (txRes.ok) {
          const tData = await txRes.json();
          setRecentTransactions(tData);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const totalOwedByMe = people.filter(p => p.balance > 0).reduce((acc, p) => acc + p.balance, 0);
  const totalOwedToMe = people.filter(p => p.balance < 0).reduce((acc, p) => acc + Math.abs(p.balance), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Overview
          </h1>
          <p className="text-gray-500 font-medium">Your personal ledger summary</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 text-white shadow-xl shadow-red-500/20 transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <span className="text-2xl">📤</span>
            </div>
          </div>
          <p className="text-red-100 font-medium text-lg mb-1">Total You Owe</p>
          <h2 className="text-5xl font-black">৳{totalOwedByMe.toLocaleString()}</h2>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white shadow-xl shadow-green-500/20 transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <span className="text-2xl">📥</span>
            </div>
          </div>
          <p className="text-green-100 font-medium text-lg mb-1">Total They Owe You</p>
          <h2 className="text-5xl font-black">৳{totalOwedToMe.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick People List */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">People</h3>
            <Link href="/people" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {people.slice(0, 5).map(person => (
              <Link key={person.id} href={`/people/${person.id}`}>
                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{person.name}</h4>
                      <p className="text-xs text-gray-500">{person.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${
                      person.balance > 0 ? "text-green-600" : person.balance < 0 ? "text-red-600" : "text-gray-500"
                    }`}>
                      ৳{Math.abs(person.balance).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {person.balance > 0 ? "You Owe" : person.balance < 0 ? "Owes You" : "Settled"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {people.length === 0 && (
              <p className="text-center text-gray-500 py-4">No people found. Add someone to start.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{tx.person.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{tx.description || "Transaction"}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${tx.type === "ADD" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "ADD" ? "+" : "-"} ৳{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
