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
      <main className="min-h-screen bg-gray-50/50 pb-24 dark:bg-gray-900 lg:ml-72 lg:pb-0">
        {children}
      </main>
    </>
  );
}
