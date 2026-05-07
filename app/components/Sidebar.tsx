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
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[1.35rem] border border-white/70 bg-white/90 p-2 shadow-2xl shadow-gray-900/15 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={async () => {
              try {
                setLoggingOut(true);
                await fetch("/api/auth/logout", { method: "POST" });
                router.replace("/auth");
              } catch {
                router.replace("/auth");
              }
            }}
            disabled={loggingOut}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <span className="text-lg leading-none">{loggingOut ? "⏳" : "🚪"}</span>
            <span>{loggingOut ? "Wait" : "Logout"}</span>
          </button>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto border-r border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-gray-900/80 lg:block">
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
                await fetch("/api/auth/logout", { method: "POST" });
                router.replace("/auth");
              } catch {
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
