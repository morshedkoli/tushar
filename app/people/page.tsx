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
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            People Ledger
          </h1>
          <p className="text-gray-500 mt-2">Manage balances and transactions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2 transform hover:scale-105"
        >
          <span className="text-xl">+</span> Add Person
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {people.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
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
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                  {person.name}
                </h3>
                {person.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                    📞 {person.phone}
                  </p>
                )}
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                  <p className={`text-3xl font-black ${
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
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Person</h2>
            <form onSubmit={handleAddPerson}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="+880 123 456 789"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
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
