"use client";
import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PersonWithTransactions, Transaction } from "../../lib/types";
import { BALANCE_LABEL_LONG, balanceState, formatMoney, formatRelative } from "../../lib/format";
import TransactionRow from "../../components/TransactionRow";
import TransactionModal from "../../components/TransactionModal";
import TransactionDetailModal from "../../components/TransactionDetailModal";
import {
  ArrowLeftIcon,
  ClockIcon,
  MinusCircleIcon,
  PhoneIcon,
  PlusCircleIcon,
} from "../../components/icons";

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [person, setPerson] = useState<PersonWithTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [txType, setTxType] = useState<"ADD" | "DEDUCT" | null>(null);
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);

  const fetchPerson = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/people/${id}`);
      if (res.ok) {
        setPerson(await res.json());
      } else {
        router.push("/people");
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchPerson(); }, [fetchPerson]);

  /** Returns an error message for the modal to show, or null on success. */
  const submitTransaction = async (amount: number, description: string): Promise<string | null> => {
    if (!txType) return "Something went wrong. Try again.";
    try {
      const res = await fetch(`/api/people/${id}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type: txType, description }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        return body?.error ?? "Could not save this transaction.";
      }
      setTxType(null);
      await fetchPerson();
      return null;
    } catch {
      return "Network error. Check your connection and try again.";
    }
  };

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

  const state = balanceState(person.balance);
  const heroTone =
    state === "owed-by-you" ? "var(--on-hero-danger)"
    : state === "owed-to-you" ? "var(--on-hero-success)"
    : "var(--on-hero-soft)";

  const lastActivity = person.transactions[0]?.date;

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <header className="page-header">
        <div className="page-header-row">
          <Link href="/people" className="btn-icon" aria-label="Back to ledger">
            <ArrowLeftIcon />
          </Link>
          <h1 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-secondary)" }}>
            Contact Details
          </h1>
          {/* Spacer keeps the title optically centred against the back button. */}
          <div style={{ width: 40 }} aria-hidden="true" />
        </div>
      </header>

      <div className="page-body fade-in">

        {/* ── Profile ── */}
        <section className="card-hero" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
          <div className="hero-content">
            <div
              className="avatar"
              aria-hidden="true"
              style={{
                width: 72, height: 72, margin: "0 auto 1rem",
                fontSize: "1.75rem", fontWeight: 800,
                background: "var(--on-hero-fill)",
                color: heroTone,
                border: "2px solid var(--on-hero-line)",
              }}
            >
              {person.name.charAt(0).toUpperCase()}
            </div>

            <h2 style={{ fontWeight: 800, fontSize: "var(--text-title)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {person.name}
            </h2>

            {person.phone ? (
              <a
                href={`tel:${person.phone}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: "0.75rem", padding: "0.4rem 1rem",
                  background: "var(--on-hero-fill)", color: "var(--on-hero-soft)",
                  borderRadius: 20, fontSize: "0.8125rem", fontWeight: 600,
                  textDecoration: "none", border: "1px solid var(--on-hero-line)",
                }}
              >
                <PhoneIcon size={15} /> {person.phone}
              </a>
            ) : (
              <p style={{ fontSize: "0.8125rem", color: "var(--on-hero-faint)", marginTop: "0.5rem" }}>
                No phone number
              </p>
            )}

            <div
              style={{
                marginTop: "1.75rem", padding: "1.25rem",
                background: "var(--on-hero-fill)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--on-hero-line)",
              }}
            >
              <p className="overline" style={{ color: "var(--on-hero-faint)" }}>Current Balance</p>
              <p
                className="num count-up"
                style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1, marginTop: "0.375rem", color: heroTone }}
              >
                {formatMoney(person.balance)}
              </p>
              <p className="overline" style={{ marginTop: "0.25rem", color: heroTone, fontWeight: 700 }}>
                {BALANCE_LABEL_LONG[state]}
              </p>
              {lastActivity && (
                <p style={{ fontSize: "0.75rem", color: "var(--on-hero-faint)", marginTop: "0.625rem" }}>
                  Last movement {formatRelative(lastActivity).toLowerCase()}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Actions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <button onClick={() => setTxType("ADD")} className="btn-success" style={{ padding: "1rem" }}>
            <PlusCircleIcon />
            Add Amount
          </button>
          <button onClick={() => setTxType("DEDUCT")} className="btn-danger" style={{ padding: "1rem" }}>
            <MinusCircleIcon />
            Deduct
          </button>
        </div>

        {/* ── History ── */}
        <section className="card" style={{ padding: "1.25rem" }}>
          <div className="section-head">
            <span className="icon-tile icon-tile-violet" aria-hidden="true"><ClockIcon /></span>
            <h3 className="section-title">Transaction History</h3>
            <span className="pill-count">{person.transactions.length}</span>
          </div>

          {person.transactions.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 1rem" }}>
              <p className="empty-body">
                No transactions yet. Use <strong style={{ color: "var(--success)" }}>Add</strong> or{" "}
                <strong style={{ color: "var(--danger)" }}>Deduct</strong> to record the first one.
              </p>
            </div>
          ) : (
            <div className="stack stagger">
              {person.transactions.map(tx => (
                <TransactionRow
                  key={tx.id}
                  type={tx.type}
                  amount={tx.amount}
                  title={tx.description || "Balance adjustment"}
                  date={tx.date}
                  runningBalance={tx.balanceAfter}
                  onView={() => setViewingTx(tx)}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {viewingTx && (
        <TransactionDetailModal
          transaction={viewingTx}
          personName={person.name}
          onClose={() => setViewingTx(null)}
        />
      )}

      {txType && (
        <TransactionModal
          personName={person.name}
          currentBalance={person.balance}
          type={txType}
          onClose={() => setTxType(null)}
          onSubmit={submitTransaction}
        />
      )}
    </div>
  );
}
