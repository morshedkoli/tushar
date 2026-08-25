"use client";
import { useEffect, useRef, useState } from "react";
import type { Person } from "../lib/types";
import { XIcon } from "./icons";

/**
 * Single implementation of "create a contact", shared by the ledger page and
 * the global quick-action drawer.
 */
export default function AddPersonModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (person: Person) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, phone: phone.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not add this person. Try again.");
        return;
      }
      onCreated(await res.json());
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div
        className="modal-drawer slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-person-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-handle" />

        <div className="modal-head">
          <div>
            <h2 id="add-person-title" className="modal-title">Add Person</h2>
            <p className="modal-sub">Create a new ledger contact</p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon btn-icon-sm" aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack gap-md">
          <div>
            <label htmlFor="add-person-name" className="field-label">
              Full Name <span className="tone-danger">*</span>
            </label>
            <input
              id="add-person-name"
              ref={nameRef}
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label htmlFor="add-person-phone" className="field-label">
              Phone <span className="field-hint">(optional)</span>
            </label>
            <input
              id="add-person-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-field"
              placeholder="e.g. +880 1700 000000"
            />
          </div>

          {error && (
            <p role="alert" className="tone-danger" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="btn-primary" style={{ flex: 1 }}>
              {saving ? "Adding…" : "Add Person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
