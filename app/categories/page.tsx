"use client";
import { useEffect, useState } from "react";

type Category = { id: number; name: string };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/categories", { cache: "no-store" });
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || "Failed to add"); return; }
    setName("");
    load();
  };

  const update = async (id: number, name: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.ok) load();
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data?.error || "Failed to delete"); return; }
    load();
  };

  const categoryIcons = ["📁", "🏷️", "💼", "🎯", "🌟", "💡", "🎨", "📌"];

  const getIconForIndex = (index: number) => categoryIcons[index % categoryIcons.length];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 pt-16 lg:pt-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{items.length} categor{items.length === 1 ? 'y' : 'ies'}</p>
      </header>

      <form onSubmit={add} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add Category</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
            placeholder="Category name (e.g., Food, Transport)" 
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
          />
          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm sm:whitespace-nowrap">
            Add Category
          </button>
        </div>
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((c, index) => (
          <div 
            key={c.id} 
            className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{getIconForIndex(index)}</span>
              <button 
                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
                onClick={()=> remove(c.id)}
              >
                Delete
              </button>
            </div>
            <input 
              className="w-full text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:outline-none focus:border-gray-900 transition-colors" 
              defaultValue={c.name} 
              onBlur={(e)=> update(c.id, e.target.value)} 
              placeholder="Category name"
            />
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <span className="text-5xl mb-3">📁</span>
            <p className="text-gray-500 text-sm">No categories yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
