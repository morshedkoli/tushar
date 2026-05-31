"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

interface Transaction {
  id: number;
  amount: number;
  type: "ADD" | "DEDUCT";
  description: string | null;
  date: string;
}

interface Person {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
  transactions: Transaction[];
}

/* ── SVG Icons ── */
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const MinusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<"ADD" | "DEDUCT">("ADD");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPerson = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/people/${resolvedParams.id}`);
    if (res.ok) {
      setPerson(await res.json());
    } else {
      router.push("/people");
    }
    setLoading(false);
  }, [resolvedParams.id, router]);

  useEffect(() => { fetchPerson(); }, [fetchPerson]);

  const handleTransaction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setSubmitting(true);
    await fetch(`/api/people/${resolvedParams.id}/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), type: txType, description }),
    });
    setAmount("");
    setDescription("");
    setShowTxModal(false);
    setSubmitting(false);
    fetchPerson();
  };

  const fmt = (n: number) => "৳" + Math.abs(n).toLocaleString();

  if (loading || !person) {
    return (
      <div className="page-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  const isPositive = person.balance > 0;  // you owe them
  const isNegative = person.balance < 0;  // they owe you
  const isSettled  = person.balance === 0;

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href="/people"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-secondary)", textDecoration: "none",
              boxShadow: "var(--shadow-sm)", transition: "all 0.2s", cursor: "pointer",
            }}
          >
            <ArrowLeftIcon />
          </Link>

          <h1 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-secondary)" }}>Contact Details</h1>

          {/* spacer to keep title centred */}
          <div style={{ width: 40 }} />
        </div>
      </header>

      <div className="fade-in" style={{ paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Profile Card ── */}
        <div className="card-hero" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%", margin: "0 auto 1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "1.75rem",
            background: isPositive ? "rgba(220,38,38,0.15)" : isNegative ? "rgba(5,150,105,0.15)" : "rgba(255,255,255,0.1)",
            color: isPositive ? "#FCA5A5" : isNegative ? "#6EE7B7" : "rgba(255,255,255,0.6)",
            border: `2px solid ${isPositive ? "rgba(252,165,165,0.3)" : isNegative ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.15)"}`,
            position: "relative", zIndex: 1,
          }}>
            {person.name.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "white", lineHeight: 1.1, position: "relative", zIndex: 1 }}>
            {person.name}
          </h2>

          {person.phone ? (
            <a
              href={`tel:${person.phone}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: "0.75rem", padding: "0.4rem 1rem",
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)", borderRadius: 20,
                fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                position: "relative", zIndex: 1,
              }}
            >
              <PhoneIcon /> {person.phone}
            </a>
          ) : (
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem", position: "relative", zIndex: 1 }}>
              No phone number
            </p>
          )}

          {/* Balance Display */}
          <div style={{
            marginTop: "1.75rem", padding: "1.25rem",
            background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(255,255,255,0.12)",
            position: "relative", zIndex: 1,
          }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>
              Current Balance
            </p>
            <p style={{
              fontSize: "2rem", fontWeight: 800, lineHeight: 1.1, marginTop: "0.375rem",
              color: isPositive ? "#FCA5A5" : isNegative ? "#6EE7B7" : "rgba(255,255,255,0.7)",
            }}>
              {fmt(person.balance)}
            </p>
            <p style={{
              fontSize: "0.75rem", fontWeight: 700, marginTop: "0.25rem",
              color: isPositive ? "#FCA5A5" : isNegative ? "#6EE7B7" : "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {isPositive ? "You owe them" : isNegative ? "They owe you" : "All settled"}
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <button
            onClick={() => { setTxType("ADD"); setShowTxModal(true); }}
            className="btn-success"
            style={{ padding: "1rem", borderRadius: "var(--radius-lg)" }}
          >
            <PlusCircleIcon />
            Add Amount
          </button>
          <button
            onClick={() => { setTxType("DEDUCT"); setShowTxModal(true); }}
            className="btn-danger"
            style={{ padding: "1rem", borderRadius: "var(--radius-lg)" }}
          >
            <MinusCircleIcon />
            Deduct
          </button>
        </div>

        {/* ── Transaction Timeline ── */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--violet)",
            }}>
              <ClockIcon />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
              Transaction History
            </span>
            <span style={{
              marginLeft: "auto", background: "var(--bg-surface)", color: "var(--text-muted)",
              fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20,
              border: "1px solid var(--border)",
            }}>
              {person.transactions.length}
            </span>
          </div>

          {person.transactions.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              No transactions yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {person.transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem 0",
                    borderBottom: i < person.transactions.length - 1 ? "1px solid var(--border)" : "none",
                    animation: "fadeIn 0.3s ease both",
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {/* Indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                      background: tx.type === "ADD" ? "var(--success-soft)" : "var(--danger-soft)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: tx.type === "ADD" ? "var(--success)" : "var(--danger)",
                    }}>
                      {tx.type === "ADD" ? <TrendUpIcon /> : <TrendDownIcon />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontWeight: 600, fontSize: "0.875rem",
                        color: "var(--text-primary)", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {tx.description || "Balance adjustment"}
                      </p>
                      <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(tx.date).toLocaleString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
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
                    <span className={tx.type === "ADD" ? "badge-success" : "badge-danger"} style={{ marginTop: 3, display: "inline-block" }}>
                      {tx.type === "ADD" ? "Added" : "Deducted"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Transaction Modal ── */}
      {showTxModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowTxModal(false)}>
          <div className="modal-drawer slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: txType === "ADD" ? "var(--success-soft)" : "var(--danger-soft)",
                  color: txType === "ADD" ? "var(--success)" : "var(--danger)",
                  fontSize: "0.75rem", fontWeight: 700,
                  padding: "4px 12px", borderRadius: 20,
                  border: `1.5px solid ${txType === "ADD" ? "#A7F3D0" : "#FECACA"}`,
                  marginBottom: "0.375rem",
                }}>
                  {txType === "ADD" ? <PlusCircleIcon /> : <MinusCircleIcon />}
                  {txType === "ADD" ? "Add Amount" : "Deduct Amount"}
                </div>
                <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                  Record Transaction
                </h2>
              </div>
              <button
                onClick={() => setShowTxModal(false)}
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

            <form onSubmit={handleTransaction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Amount */}
              <div>
                <label htmlFor="tx-amount" style={{
                  display: "block", fontWeight: 600, fontSize: "0.8125rem",
                  color: "var(--text-secondary)", marginBottom: "0.4rem",
                }}>
                  Amount <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                    fontWeight: 800, color: "var(--text-muted)", fontSize: "1.25rem", pointerEvents: "none",
                  }}>৳</span>
                  <input
                    id="tx-amount"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "2.25rem", fontSize: "1.25rem", fontWeight: 700 }}
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick chips */}
              <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
                {[100, 500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    style={{
                      flexShrink: 0, padding: "0.5rem 1rem",
                      background: amount === String(val) ? "var(--violet-soft)" : "var(--bg-surface)",
                      border: `1.5px solid ${amount === String(val) ? "var(--violet-light)" : "var(--border)"}`,
                      color: amount === String(val) ? "var(--violet)" : "var(--text-secondary)",
                      borderRadius: "var(--radius-sm)", cursor: "pointer",
                      fontSize: "0.8125rem", fontWeight: 600, transition: "all 0.15s",
                    }}
                  >
                    +৳{val.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Note */}
              <div>
                <label htmlFor="tx-description" style={{
                  display: "block", fontWeight: 600, fontSize: "0.8125rem",
                  color: "var(--text-secondary)", marginBottom: "0.4rem",
                }}>
                  Note <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <input
                  id="tx-description"
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Lunch split, shopping…"
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowTxModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={txType === "ADD" ? "btn-success" : "btn-danger"}
                  style={{ flex: 1 }}
                >
                  {submitting ? "Saving…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}