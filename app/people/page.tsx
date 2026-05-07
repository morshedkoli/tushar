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
    <div className="px-4 py-5 sm:px-6 sm:py-8 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 sm:mb-10 sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            People Ledger
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">Manage balances and transactions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          aria-label="Add Person"
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl sm:h-auto sm:px-6 sm:py-3"
        >
          <span className="text-xl">+</span> <span className="hidden sm:inline">Add Person</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {people.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <div className="group cursor-pointer rounded-3xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800/70 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-lg font-bold text-indigo-600 transition-transform group-hover:scale-110 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-400 sm:h-14 sm:w-14 sm:text-xl">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    person.balance > 0 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : person.balance < 0 
                      ? "bg-red-100 text-red-700 border border-red-200" 
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}>
                    {person.balance > 0 ? "You Owe" : person.balance < 0 ? "Owes You" : "Settled"}
                  </div>
                </div>
                
                <h3 className="mb-1 truncate text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white sm:text-2xl">
                  {person.name}
                </h3>
                {person.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                    📞 {person.phone}
                  </p>
                )}
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                  <p className={`break-words text-3xl font-black ${
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
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-2">No people yet</h3>
              <p>Add a person to start tracking balances.</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl transition-all dark:bg-gray-900 sm:p-8">
            <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white sm:mb-6">Add New Person</h2>
            <form onSubmit={handleAddPerson}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="person-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    id="person-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="person-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                  <input
                    id="person-phone"
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="+880 123 456 789"
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200"
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
