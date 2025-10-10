"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const navItems = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: "📊"
  },
  { 
    name: "Transactions", 
    href: "/transactions", 
    icon: "💰"
  },
  { 
    name: "Accounts", 
    href: "/accounts", 
    icon: "🏦"
  },
  { 
    name: "Categories", 
    href: "/categories", 
    icon: "📁"
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="p-6 min-h-full flex flex-col">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/tushar.png"
              alt="Tushar"
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
              priority
            />
            <div>
              <h2 className="text-base font-bold text-gray-900">Tushar</h2>
              <p className="text-xs text-gray-500">Personal Account</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-lg">
              💎
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Finance Dashboard</h1>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-3 px-4">QUICK ACTIONS</p>
          <div className="space-y-2">
            <Link
              href="/transactions?quick=income"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Income
            </Link>
            <Link
              href="/transactions?quick=expense"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              - Add Expense
            </Link>
          </div>
        </div>

        <form action="/api/auth/logout" method="post" className="mt-auto pt-6">
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-150 flex items-center justify-center gap-2 text-sm border border-gray-200"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}
