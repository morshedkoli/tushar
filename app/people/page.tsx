"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Person {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
}

type FilterTab = "ALL" | "OWES_YOU" | "YOU_OWE" | "SETTLED";

/* ── SVG Icons ── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const UsersEmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TAB_CONFIG: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OWES_YOU", label: "Owe Me" },
  { key: "YOU_OWE", label: "I Owe" },
  { key: "SETTLED", label: "Settled" },
];

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [adding, setAdding] = useState(false);

  const fetchPeople = async () => {
    setLoading(true);
    const res = await fetch("/api/people");
    const data = await res.json();
    setPeople(data);
    setLoading(false);
  };

  useEffect(() => { fetchPeople(); }, []);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setAdding(true);
    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phone: newPhone }),
    });
    setNewName("");
    setNewPhone("");
    setShowAddModal(false);
    setAdding(false);
    fetchPeople();
  };

  const filteredPeople = people.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery));
    if (!matchesSearch) return false;
    if (activeTab === "OWES_YOU") return p.balance < 0;
    if (activeTab === "YOU_OWE") return p.balance > 0;
    if (activeTab === "SETTLED") return p.balance === 0;
    return true;
  });

  const fmt = (n: number) => "৳" + Math.abs(n).toLocaleString();

  /* Counts per tab */
  const counts: Record<FilterTab, number> = {
    ALL: people.length,
    OWES_YOU: people.filter(p => p.balance < 0).length,
    YOU_OWE: people.filter(p => p.balance > 0).length,
    SETTLED: people.filter(p => p.balance === 0).length,
  };

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", lineHeight: 1.2 }}>Ledger</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
              {people.length} contact{people.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            aria-label="Add person"
            style={{ padding: "0.6rem 1rem", fontSize: "0.875rem" }}
          >
            <PlusIcon />
            Add
          </button>
        </div>
      </header>

      <div className="fade-in" style={{ paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>

        {/* ── Search ── */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", display: "flex", pointerEvents: "none",
          }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone…"
            className="input-field"
            style={{ paddingLeft: "2.75rem" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                background: "var(--border)", border: "none", borderRadius: "50%",
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
              }}
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{
          display: "flex", gap: "0.375rem",
          background: "var(--bg-surface)", padding: "0.25rem",
          borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
        }}>
          {TAB_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1, padding: "0.5rem 0.25rem",
                borderRadius: "var(--radius-sm)",
                border: "none", cursor: "pointer",
                fontSize: "0.75rem", fontWeight: 700,
                transition: "all 0.2s",
                background: activeTab === key ? "var(--bg-card)" : "transparent",
                color: activeTab === key ? "var(--violet)" : "var(--text-muted)",
                boxShadow: activeTab === key ? "var(--shadow-sm)" : "none",
              }}
            >
              {label}
              {counts[key] > 0 && (
                <span style={{
                  marginLeft: 4, background: activeTab === key ? "var(--violet-soft)" : "var(--border)",
                  color: activeTab === key ? "var(--violet)" : "var(--text-muted)",
                  fontSize: "0.6875rem", padding: "1px 5px", borderRadius: 20,
                }}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Contact List ── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div className="spinner" />
          </div>
        ) : filteredPeople.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <UsersEmptyIcon />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>No contacts</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {searchQuery ? "No results for your search." : "Add a person to start tracking balances."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filteredPeople.map((person, i) => (
              <Link key={person.id} href={`/people/${person.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="card card-hover"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.875rem 1rem", cursor: "pointer",
                    animation: "fadeIn 0.3s ease both",
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {/* Avatar + info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "1rem",
                      background: person.balance > 0 ? "var(--danger-soft)" : person.balance < 0 ? "var(--success-soft)" : "var(--bg-surface)",
                      color: person.balance > 0 ? "var(--danger)" : person.balance < 0 ? "var(--success)" : "var(--text-muted)",
                      border: `2px solid ${person.balance > 0 ? "#FECACA" : person.balance < 0 ? "#A7F3D0" : "var(--border)"}`,
                    }}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontWeight: 700, fontSize: "0.9375rem",
                        color: "var(--text-primary)", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {person.name}
                      </p>
                      {person.phone && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <PhoneIcon />
                          {person.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Balance */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginLeft: "0.5rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{
                        fontWeight: 800, fontSize: "1rem",
                        color: person.balance > 0 ? "var(--danger)" : person.balance < 0 ? "var(--success)" : "var(--text-muted)",
                      }}>
                        {fmt(person.balance)}
                      </p>
                      <span className={person.balance > 0 ? "badge-danger" : person.balance < 0 ? "badge-success" : "badge-neutral"}>
                        {person.balance > 0 ? "You owe" : person.balance < 0 ? "Owes you" : "Settled"}
                      </span>
                    </div>
                    <ChevronRightIcon />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>

      {/* ── Add Person Drawer ── */}
      {showAddModal && (
        <div
          className="modal-overlay fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div className="modal-drawer slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>Add Person</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: 2 }}>Create a new ledger contact</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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
                <label htmlFor="people-person-name" style={{
                  display: "block", fontWeight: 600, fontSize: "0.8125rem",
                  color: "var(--text-secondary)", marginBottom: "0.4rem",
                }}>
                  Full Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  id="people-person-name"
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. John Doe"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="people-person-phone" style={{
                  display: "block", fontWeight: 600, fontSize: "0.8125rem",
                  color: "var(--text-secondary)", marginBottom: "0.4rem",
                }}>
                  Phone <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <input
                  id="people-person-phone"
                  type="tel"
                  inputMode="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="input-field"
                  placeholder="e.g. +880 1700 000000"
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={adding} className="btn-primary" style={{ flex: 1 }}>
                  {adding ? "Adding…" : "Add Person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}