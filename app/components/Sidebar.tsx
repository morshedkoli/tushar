"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "People", href: "/people", icon: "👥" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/95 md:hidden">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
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
            className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <span className="text-lg leading-none">{loggingOut ? "⏳" : "🚪"}</span>
            <span>{loggingOut ? "Wait" : "Logout"}</span>
          </button>
        </div>
      </nav>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/95 md:flex">
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-30"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xl font-bold text-white shadow-lg">
                  T
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tushar</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ledger Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-lg shadow-indigo-500/25"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600" />
                  )}
                  <span className={`relative z-10 text-lg ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6">
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
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-100 px-4 py-3.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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