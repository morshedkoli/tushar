"use client";
import { useEffect, useState } from "react";
import {
  BALANCE_LABEL_LONG,
  CURRENCY_SYMBOL,
  balanceState,
  formatMoney,
} from "../lib/format";
import {
  ArrowRightIcon,
  EditIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XIcon,
} from "./icons";

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

type Step = "form" | "review";

/**
 * Two-step money entry: capture the amount, then confirm against a summary that
 * spells out the resulting balance. The review step exists so a mistyped amount
 * is caught before it moves a real balance.
 */
export default function TransactionModal({
  personName,
  currentBalance,
  type,
  onClose,
  onSubmit,
}: {
  personName: string;
  currentBalance: number;
  type: "ADD" | "DEDUCT";
  onClose: () => void;
  /** Resolves to an error message, or null when the transaction was saved. */
  onSubmit: (amount: number, description: string) => Promise<string | null>;
}) {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isAdd = type === "ADD";
  const tone = isAdd ? "success" : "danger";
  const value = Number(amount);
  const isValidAmount = Number.isFinite(value) && value > 0;

  const projectedBalance = currentBalance + (isAdd ? value : -value);
  const projectedState = balanceState(projectedBalance);
  const trimmedNote = description.trim();

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    setStep("review");
  };

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    const message = await onSubmit(value, trimmedNote);
    setSaving(false);
    if (message) {
      /* Send them back to the form so the amount can be corrected in place. */
      setError(message);
      setStep("form");
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div
        className="modal-drawer slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-handle" />

        <div className="modal-head">
          <div>
            <span
              className={`badge-${tone}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", marginBottom: "0.375rem" }}
            >
              {isAdd ? <PlusCircleIcon size={13} /> : <MinusCircleIcon size={13} />}
              {isAdd ? "Add Amount" : "Deduct Amount"}
            </span>
            <h2 id="tx-modal-title" className="modal-title">
              {step === "form" ? "Record Transaction" : "Confirm Transaction"}
            </h2>
            <p className="modal-sub">
              {step === "form" ? personName : "Check the details before saving"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon btn-icon-sm" aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleReview} className="stack gap-md">
            <div>
              <label htmlFor="tx-amount" className="field-label">
                Amount <span className="tone-danger">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                    fontWeight: 800, color: "var(--text-muted)", fontSize: "1.25rem", pointerEvents: "none",
                  }}
                >
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  id="tx-amount"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input-field num"
                  style={{ paddingLeft: "2.25rem", fontSize: "1.25rem", fontWeight: 700 }}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            <div className="no-scrollbar" style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
              {QUICK_AMOUNTS.map(val => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={amount === String(val)}
                  onClick={() => setAmount(String(val))}
                  className="chip"
                >
                  {CURRENCY_SYMBOL}{val.toLocaleString()}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="tx-description" className="field-label">
                Note <span className="field-hint">(optional)</span>
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

            {error && (
              <p role="alert" className="tone-danger" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={!isValidAmount} className="btn-primary" style={{ flex: 1 }}>
                Review <ArrowRightIcon />
              </button>
            </div>
          </form>
        ) : (
          <div className="stack gap-md">
            {/* Headline figure — the single most important thing to double-check. */}
            <div className={`review-hero review-hero-${tone}`}>
              <p className={`num tone-${tone}`} style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1 }}>
                {isAdd ? "+" : "−"} {formatMoney(value)}
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                {isAdd ? "added to" : "deducted from"}{" "}
                <strong style={{ color: "var(--text-primary)" }}>{personName}</strong>
              </p>
            </div>

            <dl className="summary">
              <div className="summary-row">
                <dt>Note</dt>
                <dd className={trimmedNote ? "" : "tone-neutral"}>
                  {trimmedNote || "No note"}
                </dd>
              </div>
              <div className="summary-row">
                <dt>Current balance</dt>
                <dd className="num">{formatMoney(currentBalance)}</dd>
              </div>
              <div className="summary-row summary-row-strong">
                <dt>New balance</dt>
                <dd>
                  <span className="num" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="tone-neutral">{formatMoney(currentBalance)}</span>
                    <ArrowRightIcon size={13} />
                    <strong className={`tone-${projectedState === "settled" ? "neutral" : projectedState === "owed-by-you" ? "danger" : "success"}`}>
                      {formatMoney(projectedBalance)}
                    </strong>
                  </span>
                  <span className="summary-note">{BALANCE_LABEL_LONG[projectedState]}</span>
                </dd>
              </div>
            </dl>

            {error && (
              <p role="alert" className="tone-danger" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
              <button
                type="button"
                onClick={() => { setStep("form"); setError(null); }}
                className="btn-ghost"
                style={{ flex: 1 }}
                disabled={saving}
              >
                <EditIcon /> Edit
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={saving}
                className={isAdd ? "btn-success" : "btn-danger"}
                style={{ flex: 1 }}
              >
                {saving ? "Saving…" : "Confirm & Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
