"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <>
      {/* Clean page background */}
      <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
        {children}
      </div>
      {/* Bottom tab bar — hidden on auth */}
      {!isAuthPage && <Sidebar />}
    </>
  );
}