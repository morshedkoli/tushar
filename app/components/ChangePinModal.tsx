"use client";
import { useEffect, useState } from "react";
import PinField from "./PinField";
import { CheckCircleIcon, KeyIcon, XIcon } from "./icons";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "done" };

export default function ChangePinModal({ onClose }: { onClose: () => void }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Close on its own once the success state has been shown long enough to read. */
  useEffect(() => {
    if (status.kind !== "done") return;
    const timer = setTimeout(onClose, 1600);
    return () => clearTimeout(timer);
  }, [status, onClose]);

  const complete = currentPin.length === 4 && newPin.length === 4 && confirmPin.length === 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete || saving) return;

    if (newPin !== confirmPin) {
      setStatus({ kind: "error", message: "New PIN and confirmation do not match" });
      return;
    }
    if (newPin === currentPin) {
      setStatus({ kind: "error", message: "New PIN must be different from the current one" });
      return;
    }

    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/auth/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setStatus({ kind: "error", message: body?.error ?? "Could not change your PIN." });
        return;
      }
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setStatus({ kind: "done" });
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
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
        aria-labelledby="change-pin-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-handle" />

        {status.kind === "done" ? (
          <div className="empty-state" style={{ padding: "1.5rem 1rem 2.5rem" }}>
            <span
              className="icon-tile icon-tile-success"
              style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 1rem" }}
            >
              <CheckCircleIcon size={28} />
            </span>
            <h2 id="change-pin-title" className="empty-title" style={{ fontSize: "1.125rem" }}>
              PIN updated
            </h2>
            <p className="empty-body">Use your new PIN the next time you sign in.</p>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div>
                <span
                  className="badge-neutral"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", marginBottom: "0.375rem" }}
                >
                  <KeyIcon size={13} /> Security
                </span>
                <h2 id="change-pin-title" className="modal-title">Change PIN</h2>
                <p className="modal-sub">Pick a new 4-digit code for your ledger</p>
              </div>
              <button type="button" onClick={onClose} className="btn-icon btn-icon-sm" aria-label="Close">
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="stack gap-md">
              <PinField label="Current PIN" value={currentPin} onChange={setCurrentPin} autoFocus />
              <PinField label="New PIN" value={newPin} onChange={setNewPin} />
              <PinField label="Confirm New PIN" value={confirmPin} onChange={setConfirmPin} />

              {status.kind === "error" && (
                <p role="alert" className="tone-danger" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  {status.message}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
                <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving || !complete} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? "Saving…" : "Update PIN"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
