"use client";
import { useEffect, useState } from "react";

type Account = { id: number; name: string; type: "BANK" | "MOBILE_BANKING" | "LOAN" | "CASH"; balance: number };

export default function AccountsPage() {
  const [items, setItems] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("BANK");
  const [balance, setBalance] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  const [updateAmounts, setUpdateAmounts] = useState<{[key: number]: string}>({});

  const load = async () => {
    const res = await fetch("/api/accounts", { cache: "no-store" });
    setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { name, type, balance: Number(balance) };
    const res = await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || "Failed to add"); return; }
    setName(""); setType("BANK"); setBalance("0");
    load();
  };

  const update = async (id: number, patch: Partial<Account>) => {
    const res = await fetch(`/api/accounts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    if (res.ok) load();
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data?.error || "Failed to delete");
    } else {
      load();
    }
  };

  const adjustBalance = async (id: number, amount: number, operation: 'add' | 'subtract') => {
    const account = items.find(a => a.id === id);
    if (!account) return;
    
    const newBalance = operation === 'add' 
      ? account.balance + amount 
      : account.balance - amount;
    
    await update(id, { balance: newBalance });
    setUpdateAmounts({...updateAmounts, [id]: ""});
  };

  const handleUpdateAmount = (accountId: number, value: string) => {
    setUpdateAmounts({...updateAmounts, [accountId]: value});
  };

  const getAccountIcon = (type: Account["type"]) => {
    switch(type) {
      case "BANK": return "🏦";
      case "MOBILE_BANKING": return "📱";
      case "LOAN": return "💳";
      case "CASH": return "💵";
    }
  };

  const getAccountColor = (type: Account["type"]) => {
    switch(type) {
      case "BANK": return "from-blue-500 to-cyan-500";
      case "MOBILE_BANKING": return "from-green-500 to-emerald-500";
      case "LOAN": return "from-orange-500 to-red-500";
      case "CASH": return "from-yellow-500 to-amber-500";
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 pt-16 lg:pt-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{items.length} account(s)</p>
      </header>

      <form onSubmit={addAccount} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="Account Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" value={type} onChange={(e)=>setType(e.target.value as Account["type"]) }>
            <option value="BANK">🏦 Bank</option>
            <option value="MOBILE_BANKING">📱 Mobile Banking</option>
            <option value="LOAN">💳 Loan</option>
            <option value="CASH">💵 Cash</option>
          </select>
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" type="number" step="0.01" placeholder="Balance (৳)" value={balance} onChange={(e)=>setBalance(e.target.value)} />
          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm">
            Add Account
          </button>
        </div>
        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a)=> (
          <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getAccountIcon(a.type)}</span>
              <div>
                <input 
                  className="text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:outline-none focus:border-gray-900 transition-colors" 
                  defaultValue={a.name} 
                  onBlur={(e)=> update(a.id, { name: e.target.value })} 
                />
              </div>
            </div>

            <select 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
              defaultValue={a.type} 
              onChange={(e)=> update(a.id, { type: e.target.value as Account["type"] })}
            >
              <option value="BANK">🏦 Bank</option>
              <option value="MOBILE_BANKING">📱 Mobile Banking</option>
              <option value="LOAN">💳 Loan</option>
              <option value="CASH">💵 Cash</option>
            </select>
            
            <div className="py-3 border-y border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">CURRENT BALANCE</div>
              <div className="text-2xl font-bold text-gray-900">৳{a.balance.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 mb-2">UPDATE BALANCE</div>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                type="number" 
                step="0.01" 
                placeholder="Enter amount"
                value={updateAmounts[a.id] || ""}
                onChange={(e)=> handleUpdateAmount(a.id, e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors text-sm"
                  onClick={()=> {
                    const amt = Number(updateAmounts[a.id] || 0);
                    if (amt > 0) adjustBalance(a.id, amt, 'add');
                  }}
                >
                  + Add
                </button>
                <button 
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors text-sm"
                  onClick={()=> {
                    const amt = Number(updateAmounts[a.id] || 0);
                    if (amt > 0) adjustBalance(a.id, amt, 'subtract');
                  }}
                >
                  - Subtract
                </button>
              </div>
              <button 
                className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors text-xs"
                onClick={()=> {
                  const newBalance = prompt("Enter new balance:", a.balance.toString());
                  if (newBalance !== null) {
                    update(a.id, { balance: Number(newBalance) });
                  }
                }}
              >
                Set Exact Balance
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <span className="text-5xl mb-3">🏦</span>
            <p className="text-gray-500 text-sm">No accounts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
