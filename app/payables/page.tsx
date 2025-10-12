"use client";
import { useEffect, useState } from "react";

type Contact = { id: number; name: string };
type Account = { id: number; name: string };
type Category = { id: number; name: string };

type Due = {
  id: number;
  type: "RECEIVABLE" | "PAYABLE";
  status: "OPEN" | "SETTLED";
  amount: number;
  description?: string | null;
  date: string;
  contactId: number;
  contact?: Contact;
};

export default function PayablesPage() {
  const [dues, setDues] = useState<Due[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]); // kept for lookup; not shown in UI
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [contactName, setContactName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [settleRow, setSettleRow] = useState<number | null>(null);
  const [settleAccountId, setSettleAccountId] = useState<string>("");
  const [settleCategoryId, setSettleCategoryId] = useState<string>("");
  const [settleDate, setSettleDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [settleAmount, setSettleAmount] = useState<string>("");

  const loadBasics = async () => {
    const [cRes, aRes, catRes] = await Promise.all([
      fetch("/api/contacts", { cache: "no-store" }),
      fetch("/api/accounts", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    const [cs, as, cats] = await Promise.all([cRes.json(), aRes.json(), catRes.json()]);
    setContacts(cs);
    setAccounts(as);
    setCategories(cats);
    if (as.length > 0) setSettleAccountId(String(as[0].id));
    if (cats.length > 0) setSettleCategoryId(String(cats[0].id));
  };

  const loadDues = async () => {
    const res = await fetch("/api/dues?type=PAYABLE&status=OPEN", { cache: "no-store" });
    setDues(await res.json());
  };

  useEffect(() => { loadBasics(); loadDues(); }, []);

  // Ensure a contact exists by name; create if not found; return its id
  const ensureContactId = async (name: string): Promise<number | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    try {
      const lower = trimmed.toLowerCase();
      const found: Contact | undefined = contacts.find(c => c.name.toLowerCase() === lower);
      if (found) return found.id;
      const res = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trimmed }) });
      if (!res.ok) return null;
      const created: Contact = await res.json();
      setContacts(prev => [...prev, created]);
      return created.id;
    } catch {
      return null;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !amount || Number(amount) <= 0) return;
    const id = await ensureContactId(contactName);
    if (!id) return;
    const res = await fetch("/api/dues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PAYABLE", amount: Number(amount), description, date, contactId: id }),
    });
    if (res.ok) {
      setContactName(""); setAmount(""); setDescription(""); setDate(new Date().toISOString().slice(0, 10));
      loadDues();
    }
  };

  const settle = async (id: number) => {
    if (!settleAccountId || !settleCategoryId) return;
    const amt = Number(settleAmount);
    if (!(amt > 0)) return;
    const res = await fetch(`/api/dues/${id}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: Number(settleAccountId), categoryId: Number(settleCategoryId), date: settleDate, description: "Payable settled", amount: amt }),
    });
    if (res.ok) {
      setSettleRow(null);
      setSettleAmount("");
      await Promise.all([loadDues(), loadBasics()]);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 pt-16 lg:pt-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payables</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{dues.length} open item(s)</p>
        </div>
      </header>

      <form onSubmit={submit} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add Payable</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contact Name" value={contactName} onChange={(e)=> setContactName(e.target.value)} />
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm" type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e)=> setAmount(e.target.value)} />
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Description" value={description} onChange={(e)=> setDescription(e.target.value)} />
          <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm" type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Add</button>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">DATE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">CONTACT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">AMOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">DESCRIPTION</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">SETTLE</th>
              </tr>
            </thead>
            <tbody>
              {dues.map(d => (
                <tr key={d.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-xs text-gray-700">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{d.contact?.name || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-red-700">৳{d.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.description || '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    {settleRow === d.id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select className="px-2 py-1 border rounded" value={settleAccountId} onChange={(e)=> setSettleAccountId(e.target.value)}>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <select className="px-2 py-1 border rounded" value={settleCategoryId} onChange={(e)=> setSettleCategoryId(e.target.value)}>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input className="px-2 py-1 border rounded w-28" type="number" step="0.01" placeholder={`Max ${d.amount.toFixed(2)}`} value={settleAmount} onChange={(e)=> setSettleAmount(e.target.value)} />
                        <input className="px-2 py-1 border rounded" type="date" value={settleDate} onChange={(e)=> setSettleDate(e.target.value)} />
                        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=> settle(d.id)} type="button">Confirm</button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded" onClick={()=> { setSettleRow(null); setSettleAmount(""); }} type="button">Cancel</button>
                      </div>
                    ) : (
                      <button className="px-3 py-1 bg-gray-900 text-white rounded" onClick={()=> { setSettleRow(d.id); setSettleAmount(String(d.amount)); }} type="button">Settle</button>
                    )}
                  </td>
                </tr>
              ))}
              {dues.length === 0 && (
                <tr>
                  <td className="px-4 py-12 text-center text-gray-400 text-sm" colSpan={5}>No payables</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
