"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Person {
  id: number;
  name: string;
  phone?: string | null;
  balance: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: "ADD" | "DEDUCT";
  description: string | null;
  date: string;
  person: Person;
}

/* ── SVG Icons ── */
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
  <polyline points="17 18 23 18 23 12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [peopleRes, txRes] = await Promise.all([
          fetch("/api/people"),
          fetch("/api/summary"),
        ]);
        if (peopleRes.ok) setPeople(await peopleRes.json());
        if (txRes.ok) setRecentTransactions(await txRes.json());
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalOwedByMe = people.filter(p => p.balance > 0).reduce((acc, p) => acc + p.balance, 0);
  const totalOwedToMe = people.filter(p => p.balance < 0).reduce((acc, p) => acc + Math.abs(p.balance), 0);
  const netBalance = totalOwedToMe - totalOwedByMe;

  /* Gauge */
  const totalLedger = totalOwedToMe + totalOwedByMe;
  const ratio = totalLedger === 0 ? 0.5 : totalOwedToMe / totalLedger;
  const circumference = 283;
  const strokeDashoffset = circumference - circumference * ratio;

  const fmt = (n: number) => "৳" + Math.abs(n).toLocaleString();

  if (loading) {
    return (
      <div className="page-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>Loading your ledger…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Avatar */}
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--violet) 0%, #4F46E5 100%)",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "1.0625rem",
              boxShadow: "var(--shadow-violet)",
            }}>
              T
            </div>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
                Hello, Tushar
              </h1>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 1 }}>Ledger overview</p>
            </div>
          </div>

          {/* Notification button */}
          <button
            aria-label="Notifications"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
              boxShadow: "var(--shadow-sm)", position: "relative",
              transition: "all 0.2s",
            }}
          >
            <BellIcon />
            {people.length > 0 && (
              <span style={{
                position: "absolute", top: 8, right: 8,
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--violet)", border: "2px solid white",
                animation: "pulse-dot 2s ease-in-out infinite",
              }} />
            )}
          </button>
        </div>
      </header>

      <div className="fade-in" style={{ paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Hero Balance Card ── */}
        <div className="card-hero" style={{ padding: "1.75rem 1.5rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>
            Net Standing
          </p>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", justifyContent: "space-between" }}>
            <div style={{ zIndex: 1, position: "relative" }}>
              <div style={{
                fontSize: "2.25rem", fontWeight: 800, lineHeight: 1,
                color: "white", letterSpacing: "-0.02em",
              }}>
                {fmt(netBalance)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.5rem" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: netBalance >= 0 ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)",
                  color: netBalance >= 0 ? "#6EE7B7" : "#FCA5A5",
                  fontSize: "0.75rem", fontWeight: 700,
                  padding: "3px 10px", borderRadius: 20,
                }}>
                  {netBalance >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                  {netBalance >= 0 ? "In your favour" : "You owe more"}
                </span>
              </div>
            </div>

            {/* Mini gauge */}
            <div style={{ position: "relative", width: 72, height: 72, zIndex: 1, flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={netBalance >= 0 ? "#6EE7B7" : "#FCA5A5"}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", lineHeight: 1 }}>
                  {Math.round(ratio * 100)}%
                </span>
                <span style={{ fontSize: "0.5rem", fontWeight: 600, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>CREDIT</span>
              </div>
            </div>
          </div>

          {/* Two sub-stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem", marginTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "1.25rem",
            position: "relative", zIndex: 1,
          }}>
            <div>
              <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>They Owe You</p>
              <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#6EE7B7", marginTop: 3 }}>{fmt(totalOwedToMe)}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>You Owe</p>
              <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#FCA5A5", marginTop: 3 }}>{fmt(totalOwedByMe)}</p>
            </div>
          </div>
        </div>

        {/* ── Contacts Section ── */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--violet)",
              }}>
                <UsersIcon />
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>Contacts</span>
            </div>
            <Link href="/people" style={{
              fontSize: "0.8125rem", fontWeight: 600, color: "var(--violet)",
              textDecoration: "none", display: "flex", alignItems: "center", gap: 2,
            }}>
              View All <ChevronRightIcon />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {people.slice(0, 4).map((person, i) => (
              <Link key={person.id} href={`/people/${person.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="card-hover"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem 0.875rem",
                    background: "var(--bg-surface)", border: "1px solid transparent",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer", transition: "all 0.2s",
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "0.875rem",
                      background: person.balance > 0 ? "var(--danger-soft)" : person.balance < 0 ? "var(--success-soft)" : "var(--bg-surface)",
                      color: person.balance > 0 ? "var(--danger)" : person.balance < 0 ? "var(--success)" : "var(--text-muted)",
                      border: `1.5px solid ${person.balance > 0 ? "#FECACA" : person.balance < 0 ? "#A7F3D0" : "var(--border)"}`,
                    }}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {person.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 1 }}>{person.phone || "No contact"}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "0.5rem" }}>
                    <p style={{
                      fontWeight: 800, fontSize: "0.9375rem",
                      color: person.balance > 0 ? "var(--danger)" : person.balance < 0 ? "var(--success)" : "var(--text-muted)",
                    }}>
                      {fmt(person.balance)}
                    </p>
                    <span className={person.balance > 0 ? "badge-danger" : person.balance < 0 ? "badge-success" : "badge-neutral"}>
                      {person.balance > 0 ? "You owe" : person.balance < 0 ? "Owes you" : "Settled"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {people.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  No contacts yet. Tap the <strong style={{ color: "var(--violet)" }}>+</strong> button to create your first ledger entry.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "var(--amber-soft)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--amber)",
            }}>
              <ActivityIcon />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>Recent Activity</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {recentTransactions.slice(0, 5).map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 0",
                  borderBottom: i < Math.min(recentTransactions.length, 5) - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  {/* Tx type indicator */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                    background: tx.type === "ADD" ? "var(--success-soft)" : "var(--danger-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: tx.type === "ADD" ? "var(--success)" : "var(--danger)",
                  }}>
                    {tx.type === "ADD" ? <TrendUpIcon /> : <TrendDownIcon />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.person.name}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.description || "Balance adjustment"}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "0.5rem" }}>
                  <p style={{
                    fontWeight: 800, fontSize: "0.9375rem",
                    color: tx.type === "ADD" ? "var(--success)" : "var(--danger)",
                  }}>
                    {tx.type === "ADD" ? "+" : "−"} {fmt(tx.amount)}
                  </p>
                  <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 1 }}>
                    {new Date(tx.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <p style={{ padding: "1.5rem 0", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                No transactions yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}