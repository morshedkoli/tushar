"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Person } from "../lib/types";
import PersonRow from "../components/PersonRow";
import AddPersonModal from "../components/AddPersonModal";
import { ListSkeleton } from "../components/Skeletons";
import { useLedgerRefresh } from "../lib/useLedgerRefresh";
import { PlusIcon, SearchIcon, SortIcon, UsersIcon, XIcon } from "../components/icons";

type FilterTab = "ALL" | "OWES_YOU" | "YOU_OWE" | "SETTLED";
type SortKey = "RECENT" | "NAME" | "AMOUNT";

const TAB_CONFIG: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OWES_YOU", label: "Owe Me" },
  { key: "YOU_OWE", label: "I Owe" },
  { key: "SETTLED", label: "Settled" },
];

const SORT_CONFIG: { key: SortKey; label: string }[] = [
  { key: "RECENT", label: "Recent" },
  { key: "NAME", label: "Name" },
  { key: "AMOUNT", label: "Amount" },
];

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("RECENT");

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/people");
      if (res.ok) setPeople(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPeople(); }, [fetchPeople]);
  useLedgerRefresh(fetchPeople);

  const counts = useMemo<Record<FilterTab, number>>(() => ({
    ALL: people.length,
    OWES_YOU: people.filter(p => p.balance < 0).length,
    YOU_OWE: people.filter(p => p.balance > 0).length,
    SETTLED: people.filter(p => p.balance === 0).length,
  }), [people]);

  const visiblePeople = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = people.filter(p => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.phone?.toLowerCase().includes(query) ?? false);
      if (!matchesSearch) return false;
      if (activeTab === "OWES_YOU") return p.balance < 0;
      if (activeTab === "YOU_OWE") return p.balance > 0;
      if (activeTab === "SETTLED") return p.balance === 0;
      return true;
    });

    /* RECENT is the order the API already returns — most recent transaction first. */
    if (sortKey === "NAME") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortKey === "AMOUNT") {
      return [...filtered].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    }
    return filtered;
  }, [people, searchQuery, activeTab, sortKey]);

  const handleCreated = (person: Person) => {
    setPeople(prev => [person, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Ledger</h1>
            <p className="page-subtitle">
              {people.length} contact{people.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ padding: "0.6rem 1rem" }}
          >
            <PlusIcon size={18} />
            Add
          </button>
        </div>
      </header>

      <div className="page-body fade-in" style={{ gap: "0.875rem" }}>

        {/* ── Search ── */}
        <div style={{ position: "relative" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
              color: "var(--text-muted)", display: "flex", pointerEvents: "none",
            }}
          >
            <SearchIcon size={18} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone…"
            aria-label="Search contacts"
            className="input-field"
            style={{ paddingLeft: "2.75rem" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              style={{
                position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                background: "var(--border)", border: "none", borderRadius: "50%",
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
              }}
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="segmented" role="tablist" aria-label="Filter contacts">
          {TAB_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className="segment"
            >
              {label}
              {counts[key] > 0 && <span className="segment-count">{counts[key]}</span>}
            </button>
          ))}
        </div>

        {/* ── Sort ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            className="overline"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}
          >
            <SortIcon /> Sort
          </span>
          <div className="segmented" role="tablist" aria-label="Sort contacts" style={{ flex: 1 }}>
            {SORT_CONFIG.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={sortKey === key}
                onClick={() => setSortKey(key)}
                className="segment"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Contact list ── */}
        {loading ? (
          <div className="card" style={{ padding: "0.5rem" }}>
            <ListSkeleton rows={5} />
          </div>
        ) : visiblePeople.length === 0 ? (
          <div className="empty-state">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "var(--border-strong)" }}>
              <UsersIcon size={48} strokeWidth={1.2} />
            </div>
            <h3 className="empty-title">{searchQuery ? "No matches" : "No contacts"}</h3>
            <p className="empty-body">
              {searchQuery
                ? `Nothing matches “${searchQuery}”. Try a different name or number.`
                : activeTab !== "ALL"
                  ? "No contacts in this filter yet."
                  : "Add a person to start tracking balances."}
            </p>
          </div>
        ) : (
          <div className="card stack stagger" style={{ padding: "0.5rem" }}>
            {visiblePeople.map(person => (
              <PersonRow key={person.id} person={person} showPhone showChevron />
            ))}
          </div>
        )}

      </div>

      {showAddModal && (
        <AddPersonModal onClose={() => setShowAddModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
