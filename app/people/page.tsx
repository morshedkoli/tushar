"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Person {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const fetchPeople = async () => {
    setLoading(true);
    const res = await fetch("/api/people");
    const data = await res.json();
    setPeople(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phone: newPhone }),
    });
    setNewName("");
    setNewPhone("");
    setShowAddModal(false);
    fetchPeople();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            People Ledger
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage balances and transactions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          aria-label="Add Person"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 sm:h-auto sm:px-6 sm:py-3"
        >
          <span className="text-xl">+</span> <span className="hidden sm:inline">Add Person</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-30"></div>
            <div className="relative h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {people.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/80 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 font-bold text-indigo-600 transition-transform duration-200 group-hover:scale-110 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-400">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    person.balance > 0 
                      ? "bg-green-100 text-green-700" 
                      : person.balance < 0 
                      ? "bg-red-100 text-red-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {person.balance > 0 ? "You Owe" : person.balance < 0 ? "Owes You" : "Settled"}
                  </div>
                </div>
                
                <h3 className="mb-1 truncate text-lg font-bold text-gray-900 dark:text-white">
                  {person.name}
                </h3>
                {person.phone && (
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">📞 {person.phone}</p>
                )}
                
                <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                  <p className="text-xs font-medium text-gray-500">Balance</p>
                  <p className={`text-2xl font-bold ${
                    person.balance > 0 
                      ? "text-green-600" 
                      : person.balance < 0 
                      ? "text-red-600" 
                      : "text-gray-900 dark:text-white"
                  }`}>
                    ৳{Math.abs(person.balance).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {people.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <div className="mb-4 text-5xl">👥</div>
              <h3 className="mb-2 text-xl font-bold">No people yet</h3>
              <p>Add a person to start tracking balances.</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-7">
            <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white sm:mb-6">Add New Person</h2>
            <form onSubmit={handleAddPerson}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="person-name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="person-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="person-phone" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone (Optional)
                  </label>
                  <input
                    id="person-phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="+880 123 456 789"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}