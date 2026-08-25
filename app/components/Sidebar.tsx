"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import AddPersonModal from "./AddPersonModal";
import ChangePinModal from "./ChangePinModal";
import { emitLedgerRefresh } from "../lib/useLedgerRefresh";
import { HomeIcon, KeyIcon, LogoutIcon, PersonIcon, PlusIcon, UsersIcon, XIcon } from "./icons";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleCreated = () => {
    setShowPersonModal(false);
    setShowQuickAction(false);
    /* Refresh whichever list is on screen instead of reloading the whole document. */
    if (pathname === "/people" || pathname === "/") {
      emitLedgerRefresh();
    } else {
      router.push("/people");
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/auth");
    } catch {
      router.replace("/auth");
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav" aria-label="Primary">
        <div
          style={{
            maxWidth: "var(--page-max)", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-around",
            height: "var(--nav-height)", padding: "0 1rem", position: "relative",
          }}
        >
          <Link href="/" className="nav-tab" aria-current={isActive("/") ? "page" : undefined}>
            <HomeIcon size={22} filled={isActive("/")} />
            <span>Home</span>
          </Link>

          <div style={{ position: "relative", top: -18, zIndex: 10 }}>
            <button
              onClick={() => setShowQuickAction(true)}
              aria-label="Quick actions"
              className="fab"
            >
              <PlusIcon size={22} />
            </button>
          </div>

          <Link href="/people" className="nav-tab" aria-current={isActive("/people") ? "page" : undefined}>
            <UsersIcon size={22} filled={isActive("/people")} />
            <span>Ledger</span>
          </Link>
        </div>
      </nav>

      {/* ── Quick Action Drawer ── */}
      {showQuickAction && (
        <div className="modal-overlay fade-in" onClick={() => setShowQuickAction(false)}>
          <div
            className="modal-drawer slide-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-actions-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-handle" />

            <div className="modal-head" style={{ marginBottom: "1.25rem" }}>
              <h3 id="quick-actions-title" className="modal-title" style={{ fontSize: "1.125rem" }}>
                Quick Actions
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAction(false)}
                className="btn-icon btn-icon-sm"
                aria-label="Close"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="stack gap-sm">
              {/* Primary action gets the full width; security actions sit below it. */}
              <button
                onClick={() => setShowPersonModal(true)}
                className="action-tile action-tile-wide action-tile-violet"
              >
                <span className="action-tile-icon"><PersonIcon size={24} /></span>
                <span>
                  <span className="action-tile-title">Add Person</span>
                  <span className="action-tile-sub">New ledger entry</span>
                </span>
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <button onClick={() => setShowPinModal(true)} className="action-tile action-tile-neutral">
                  <span className="action-tile-icon"><KeyIcon size={24} /></span>
                  <span>
                    <span className="action-tile-title">Change PIN</span>
                    <span className="action-tile-sub">Update your code</span>
                  </span>
                </button>

                <button onClick={handleLogout} disabled={loggingOut} className="action-tile action-tile-danger">
                  <span className="action-tile-icon"><LogoutIcon size={24} /></span>
                  <span>
                    <span className="action-tile-title">{loggingOut ? "Signing out…" : "Sign Out"}</span>
                    <span className="action-tile-sub">Secure logout</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPersonModal && (
        <AddPersonModal onClose={() => setShowPersonModal(false)} onCreated={handleCreated} />
      )}

      {showPinModal && (
        <ChangePinModal
          onClose={() => {
            setShowPinModal(false);
            setShowQuickAction(false);
          }}
        />
      )}
    </>
  );
}
