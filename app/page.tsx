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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-30"></div>
          <div className="relative h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your personal ledger summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-xl shadow-red-500/20 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-2.5">
              <span className="text-xl">📤</span>
            </div>
            <p className="text-sm font-medium text-red-100">Total You Owe</p>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">৳{totalOwedByMe.toLocaleString()}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-xl shadow-green-500/20 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-2.5">
              <span className="text-xl">📥</span>
            </div>
            <p className="text-sm font-medium text-green-100">Total They Owe You</p>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">৳{totalOwedToMe.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">People</h3>
            <Link href="/people" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
              View All →
            </Link>
          </div>
          
          <div className="space-y-3">
            {people.slice(0, 5).map(person => (
              <Link key={person.id} href={`/people/${person.id}`}>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-800 dark:hover:bg-gray-800/50">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 font-bold text-indigo-600 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-400">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-gray-900 dark:text-white">{person.name}</h4>
                      <p className="text-xs text-gray-500">{person.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-base font-bold ${
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
              <p className="py-4 text-center text-gray-500">No people found. Add someone to start.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Recent Activity</h3>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{tx.person.name}</p>
                    <p className="text-sm text-gray-500">{tx.description || "Transaction"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-base font-bold ${tx.type === "ADD" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "ADD" ? "+" : "-"} ৳{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}