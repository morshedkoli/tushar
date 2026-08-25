"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Person, TransactionWithPerson } from "./lib/types";
import { formatMoney, formatMoneyCompact } from "./lib/format";
import { useLedgerRefresh } from "./lib/useLedgerRefresh";
import PersonRow from "./components/PersonRow";
import TransactionRow from "./components/TransactionRow";
import TransactionDetailModal from "./components/TransactionDetailModal";
import { HeroSkeleton, ListSkeleton } from "./components/Skeletons";
import {
  ActivityIcon,
  ChevronRightIcon,
  TrendDownIcon,
  TrendUpIcon,
  UsersIcon,
} from "./components/icons";

const RECENT_CONTACTS = 4;
const RECENT_ACTIVITY = 5;

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingTx, setViewingTx] = useState<TransactionWithPerson | null>(null);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useLedgerRefresh(fetchData);

  const stats = useMemo(() => {
    const owedByYou = people.filter(p => p.balance > 0).reduce((acc, p) => acc + p.balance, 0);
    const owedToYou = people.filter(p => p.balance < 0).reduce((acc, p) => acc + Math.abs(p.balance), 0);
    const total = owedToYou + owedByYou;
    return {
      owedByYou,
      owedToYou,
      net: owedToYou - owedByYou,
      total,
      /* Share of the open ledger that is money coming back to you. */
      creditShare: total === 0 ? 0.5 : owedToYou / total,
      openCount: people.filter(p => p.balance !== 0).length,
    };
  }, [people]);

  const inYourFavour = stats.net >= 0;

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <header className="page-header">
        <div className="page-header-row">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="avatar avatar-brand" aria-hidden="true">T</span>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.0625rem", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                Hello, Tushar
              </h1>
              <p className="page-subtitle">
                {loading
                  ? "Loading your ledger…"
                  : stats.openCount > 0
                    ? `${stats.openCount} open balance${stats.openCount !== 1 ? "s" : ""}`
                    : "Everything is settled"}
              </p>
            </div>
          </div>

          <Link href="/people" className="btn-icon" aria-label="Open ledger">
            <UsersIcon size={20} />
            {stats.openCount > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", transform: "translate(14px, -14px)",
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--violet)", border: "2px solid #fff",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
            )}
          </Link>
        </div>
      </header>

      <div className="page-body fade-in">

        {/* ── Hero: net standing ── */}
        {loading ? (
          <HeroSkeleton />
        ) : (
          <section className="card-hero" style={{ padding: "1.75rem 1.5rem" }} aria-label="Net standing">
            <div className="hero-content">
              <p className="overline" style={{ color: "var(--on-hero-soft)" }}>Net Standing</p>

              <div className="count-up" style={{ marginTop: "0.5rem" }}>
                <span
                  className="num"
                  style={{ fontSize: "var(--text-hero)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}
                >
                  {formatMoneyCompact(stats.net)}
                </span>
              </div>

              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, marginTop: "0.75rem",
                  background: inYourFavour ? "rgba(5,150,105,0.22)" : "rgba(220,38,38,0.22)",
                  color: inYourFavour ? "var(--on-hero-success)" : "var(--on-hero-danger)",
                  fontSize: "0.75rem", fontWeight: 700, padding: "4px 11px", borderRadius: 20,
                }}
              >
                {inYourFavour ? <TrendUpIcon /> : <TrendDownIcon />}
                {inYourFavour ? "In your favour" : "You owe more"}
              </span>

              {/* Balance beam — proportional split of the open ledger */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--on-hero-line)" }}>
                <div
                  role="img"
                  aria-label={`${formatMoney(stats.owedToYou)} owed to you, ${formatMoney(stats.owedByYou)} owed by you`}
                  style={{
                    display: "flex", height: 8, borderRadius: 999, overflow: "hidden",
                    background: "var(--on-hero-fill)", gap: 2,
                  }}
                >
                  <span style={{
                    width: `${stats.creditShare * 100}%`,
                    background: "var(--on-hero-success)",
                    borderRadius: 999,
                    transition: "width 0.8s var(--ease-out)",
                  }} />
                  <span style={{
                    flex: 1,
                    background: "var(--on-hero-danger)",
                    borderRadius: 999,
                  }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.875rem" }}>
                  <div>
                    <p className="overline" style={{ color: "var(--on-hero-faint)" }}>They Owe You</p>
                    <p className="num" style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--on-hero-success)", marginTop: 3 }}>
                      {formatMoney(stats.owedToYou)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p className="overline" style={{ color: "var(--on-hero-faint)" }}>You Owe</p>
                    <p className="num" style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--on-hero-danger)", marginTop: 3 }}>
                      {formatMoney(stats.owedByYou)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Recently active contacts ── */}
        <section className="card" style={{ padding: "1.25rem" }}>
          <div className="section-head">
            <span className="icon-tile icon-tile-violet" aria-hidden="true"><UsersIcon size={18} /></span>
            <h2 className="section-title">Recently Active</h2>
            <Link href="/people" className="link-more">
              View All <ChevronRightIcon />
            </Link>
          </div>

          {loading ? (
            <ListSkeleton rows={3} />
          ) : people.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 1rem" }}>
              <p className="empty-body">
                No contacts yet. Tap the <strong style={{ color: "var(--violet)" }}>+</strong> button
                to create your first ledger entry.
              </p>
            </div>
          ) : (
            <div className="stack gap-xs stagger">
              {people.slice(0, RECENT_CONTACTS).map(person => (
                <PersonRow key={person.id} person={person} showPhone />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent activity feed ── */}
        <section className="card" style={{ padding: "1.25rem" }}>
          <div className="section-head">
            <span className="icon-tile icon-tile-amber" aria-hidden="true"><ActivityIcon /></span>
            <h2 className="section-title">Recent Activity</h2>
          </div>

          {loading ? (
            <ListSkeleton rows={3} />
          ) : recentTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem 1rem" }}>
              <p className="empty-body">No transactions yet.</p>
            </div>
          ) : (
            <div className="stack stagger">
              {recentTransactions.slice(0, RECENT_ACTIVITY).map(tx => (
                <TransactionRow
                  key={tx.id}
                  type={tx.type}
                  amount={tx.amount}
                  title={tx.person.name}
                  subtitle={tx.description}
                  date={tx.date}
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
          personName={viewingTx.person.name}
          onClose={() => setViewingTx(null)}
        />
      )}
    </div>
  );
}
