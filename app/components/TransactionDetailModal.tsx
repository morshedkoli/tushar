"use client";
import { useEffect } from "react";
import type { Transaction } from "../lib/types";
import { balanceState, BALANCE_LABEL_LONG, formatDateTime, formatMoney, formatRelative } from "../lib/format";
import { ArrowRightIcon, MinusCircleIcon, PlusCircleIcon, XIcon } from "./icons";

/**
 * Read-only detail for a single movement, including the balance on either side
 * of it so the entry can be reconciled against a statement.
 */
export default function TransactionDetailModal({
  transaction,
  personName,
  onClose,
}: {
  transaction: Transaction;
  personName?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isAdd = transaction.type === "ADD";
  const tone = isAdd ? "success" : "danger";
  const afterState = balanceState(transaction.balanceAfter);
  const afterTone =
    afterState === "owed-by-you" ? "danger" : afterState === "owed-to-you" ? "success" : "neutral";

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div
        className="modal-drawer slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-detail-title"
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
              {isAdd ? "Added" : "Deducted"}
            </span>
            <h2 id="tx-detail-title" className="modal-title">Transaction Details</h2>
            <p className="modal-sub">{formatRelative(transaction.date)}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon btn-icon-sm" aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        <div className="stack gap-md">
          <div className={`review-hero review-hero-${tone}`}>
            <p className={`num tone-${tone}`} style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1 }}>
              {isAdd ? "+" : "−"} {formatMoney(transaction.amount)}
            </p>
            {personName && (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                {isAdd ? "added to" : "deducted from"}{" "}
                <strong style={{ color: "var(--text-primary)" }}>{personName}</strong>
              </p>
            )}
          </div>

          <dl className="summary">
            <div className="summary-row">
              <dt>Note</dt>
              <dd className={transaction.description ? "" : "tone-neutral"}>
                {transaction.description || "No note"}
              </dd>
            </div>
            <div className="summary-row">
              <dt>Date &amp; time</dt>
              <dd>{formatDateTime(transaction.date)}</dd>
            </div>
            <div className="summary-row">
              <dt>Balance before</dt>
              <dd className="num">{formatMoney(transaction.balanceBefore)}</dd>
            </div>
            <div className="summary-row summary-row-strong">
              <dt>Balance after</dt>
              <dd>
                <span className="num" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="tone-neutral">{formatMoney(transaction.balanceBefore)}</span>
                  <ArrowRightIcon size={13} />
                  <strong className={`tone-${afterTone}`}>{formatMoney(transaction.balanceAfter)}</strong>
                </span>
                <span className="summary-note">{BALANCE_LABEL_LONG[afterState]}</span>
              </dd>
            </div>
            <div className="summary-row">
              <dt>Reference</dt>
              <dd className="num tone-neutral">#{transaction.id}</dd>
            </div>
          </dl>

          <button type="button" onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
