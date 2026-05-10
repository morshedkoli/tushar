"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24 dark:from-gray-950 dark:to-gray-900 md:pb-0 md:pl-72">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">{children}</div>
      </main>
    </>
  );
}