"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

/* ── Inline SVG icons ── */
const HomeIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const UsersIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);

  const [showPersonModal, setShowPersonModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setAdding(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, phone: newPhone }),
      });
      if (res.ok) {
        setNewName("");
        setNewPhone("");
        setShowPersonModal(false);
        setShowQuickAction(false);
        if (pathname === "/people" || pathname === "/") {
          window.location.reload();
        } else {
          router.push("/people");
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAdding(false);
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

  const navActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Bottom Navigation Bar ── */}
      <nav className="bottom-nav">
        <div style={{
          maxWidth: 600,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          height: 64,
          padding: "0 1rem",
          position: "relative",
        }}>
          {/* Home tab */}
          <Link
            href="/"
            aria-label="Home"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px",
              borderRadius: 14,
              transition: "all 0.2s",
              color: navActive("/") ? "var(--violet)" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: 10,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            <HomeIcon filled={navActive("/")} />
            <span>Home</span>
          </Link>

          {/* FAB */}
          <div style={{ position: "relative", top: -18, zIndex: 10 }}>
            <button
              onClick={() => setShowQuickAction(true)}
              aria-label="Quick Actions"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--violet) 0%, #4F46E5 100%)",
                color: "white",
                border: "3px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-violet)",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <PlusIcon />
            </button>
          </div>

          {/* Ledger tab */}
          <Link
            href="/people"
            aria-label="Ledger"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px",
              borderRadius: 14,
              transition: "all 0.2s",
              color: navActive("/people") ? "var(--violet)" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: 10,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            <UsersIcon filled={navActive("/people")} />
            <span>Ledger</span>
          </Link>
        </div>
      </nav>

      {/* ── Quick Action Drawer ── */}
      {showQuickAction && (
        <div
          className="modal-overlay fade-in"
          onClick={() => setShowQuickAction(false)}
        >
          <div className="modal-drawer slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--text-primary)" }}>Quick Actions</h3>
              <button
                onClick={() => setShowQuickAction(false)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.15s",
                }}
              >
                <XIcon />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                onClick={() => setShowPersonModal(true)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "0.75rem", padding: "1.25rem 1rem",
                  background: "var(--violet-soft)", border: "1.5px solid #C7D2FE",
                  borderRadius: "var(--radius-xl)", cursor: "pointer",
                  transition: "all 0.2s", textAlign: "center",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#E0E7FF")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--violet-soft)")}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "white", border: "1.5px solid #C7D2FE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--violet)", boxShadow: "var(--shadow-sm)",
                }}>
                  <PersonIcon />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>Add Person</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>New ledger entry</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "0.75rem", padding: "1.25rem 1rem",
                  background: "#FEF2F2", border: "1.5px solid #FECACA",
                  borderRadius: "var(--radius-xl)", cursor: loggingOut ? "not-allowed" : "pointer",
                  transition: "all 0.2s", textAlign: "center", opacity: loggingOut ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.background = "#FEE2E2"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "#FEF2F2")}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "white", border: "1.5px solid #FECACA",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--danger)", boxShadow: "var(--shadow-sm)",
                }}>
                  <LogoutIcon />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--danger)" }}>
                    {loggingOut ? "Signing out…" : "Sign Out"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>Secure logout</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Person Drawer ── */}
      {showPersonModal && (
        <div
          className="modal-overlay fade-in"
          onClick={() => setShowPersonModal(false)}
        >
          <div className="modal-drawer slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>Add Person</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: 2 }}>Create a new ledger contact</p>
              </div>
              <button
                onClick={() => setShowPersonModal(false)}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-secondary)",
                }}
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleAddPerson} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label htmlFor="modal-person-name" style={{
                  display: "block", fontWeight: 600, fontSize: "0.8125rem",
                  color: "var(--text-secondary)", marginBottom: "0.4rem",
                }}>
                  Full Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  id="modal-person-name"
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label htmlFor="modal-person-phone" style={{
                  display: "block", fontWeight: 600, fontSize: "0.8125rem",
                  color: "var(--text-secondary)", marginBottom: "0.4rem",
                }}>
                  Phone <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <input
                  id="modal-person-phone"
                  type="tel"
                  inputMode="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="input-field"
                  placeholder="e.g. +880 1700 000000"
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowPersonModal(false)}
                  className="btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {adding ? "Adding…" : "Add Person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}