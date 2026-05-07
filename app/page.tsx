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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:space-y-10 lg:p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            Overview
          </h1>
          <p className="text-sm font-medium text-gray-500 sm:text-base">Your personal ledger summary</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-xl shadow-red-500/20 transition-all hover:-translate-y-1 sm:p-8">
          <div className="mb-4 flex items-start justify-between sm:mb-6">
            <div className="rounded-2xl bg-white/20 p-3">
              <span className="text-2xl">📤</span>
            </div>
          </div>
          <p className="mb-1 text-base font-medium text-red-100 sm:text-lg">Total You Owe</p>
          <h2 className="break-words text-4xl font-black leading-tight sm:text-5xl">৳{totalOwedByMe.toLocaleString()}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-xl shadow-green-500/20 transition-all hover:-translate-y-1 sm:p-8">
          <div className="mb-4 flex items-start justify-between sm:mb-6">
            <div className="rounded-2xl bg-white/20 p-3">
              <span className="text-2xl">📥</span>
            </div>
          </div>
          <p className="mb-1 text-base font-medium text-green-100 sm:text-lg">Total They Owe You</p>
          <h2 className="break-words text-4xl font-black leading-tight sm:text-5xl">৳{totalOwedToMe.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        {/* Quick People List */}
        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-xl backdrop-blur-xl dark:bg-gray-800/70 sm:p-8">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">People</h3>
            <Link href="/people" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
              View All →
            </Link>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {people.slice(0, 5).map(person => (
              <Link key={person.id} href={`/people/${person.id}`}>
                <div className="group flex items-center justify-between gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-gray-100 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-700/50 sm:p-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 font-bold text-indigo-600 transition-transform group-hover:scale-110 dark:from-indigo-900 dark:to-purple-900 dark:text-indigo-400 sm:h-12 sm:w-12">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white">{person.name}</h4>
                      <p className="text-xs text-gray-500">{person.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-base font-black sm:text-lg ${
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
        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-xl backdrop-blur-xl dark:bg-gray-800/70 sm:p-8">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Recent Activity</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50 sm:p-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900 dark:text-white">{tx.person.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{tx.description || "Transaction"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-base font-black sm:text-lg ${tx.type === "ADD" ? "text-green-600" : "text-red-600"}`}>
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
