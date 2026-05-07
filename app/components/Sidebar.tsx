"use client";
import { usePathname, useRouter } from "next/navigation";
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
    name: "People",
    href: "/people",
    icon: "👥"
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
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

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 shadow-2xl overflow-y-auto z-40 transition-transform duration-300 ease-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="p-8 min-h-full flex flex-col">
        <div className="mb-8 pb-8 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-40 animate-pulse"></div>
              <Image
                src="/tushar.png"
                alt="Tushar"
                width={56}
                height={56}
                className="rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-md relative z-10"
                unoptimized
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tushar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ledger Manager</p>
            </div>
          </div>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "text-white shadow-lg shadow-indigo-500/30"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-100 transition-opacity" />
                )}
                <span className={`text-xl relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                <span className="font-semibold text-sm relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={async () => {
              try {
                setLoggingOut(true);
                const res = await fetch("/api/auth/logout", { method: "POST" });
                router.replace("/auth");
              } catch (e) {
                router.replace("/auth");
              }
            }}
            disabled={loggingOut}
            className={`w-full px-5 py-3.5 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-md hover:shadow-lg ${
              loggingOut
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white"
            }`}
          >
            <span className="text-lg">{loggingOut ? "⏳" : "🚪"}</span>
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
