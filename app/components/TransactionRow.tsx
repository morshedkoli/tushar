"use client";
import { formatMoney, formatRelative } from "../lib/format";
import { EyeIcon, TrendDownIcon, TrendUpIcon } from "./icons";

/**
 * One movement in a ledger. `title` is the person's name on the dashboard feed
 * and the note on a person's own history — same shape, different emphasis.
 */
export default function TransactionRow({
  type,
  amount,
  title,
  subtitle,
  date,
  runningBalance,
  onView,
}: {
  type: "ADD" | "DEDUCT";
  amount: number;
  title: string;
  subtitle?: string | null;
  date: string;
  /** Ledger balance immediately after this movement, when known. */
  runningBalance?: number;
  /** Supplying this renders a View button that opens the full detail. */
  onView?: () => void;
}) {
  const isAdd = type === "ADD";
  const tone = isAdd ? "success" : "danger";

  return (
    <div className="row row-divided">
      <span className="row-main">
        <span
          className={`icon-tile icon-tile-${tone}`}
          style={{ width: 36, height: 36, borderRadius: 12 }}
          aria-hidden="true"
        >
          {isAdd ? <TrendUpIcon /> : <TrendDownIcon />}
        </span>
        <span style={{ minWidth: 0 }}>
          <span
            className="truncate"
            style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}
          >
            {title}
          </span>
          <span className="row-meta truncate">
            <span>{formatRelative(date)}</span>
            {subtitle ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{subtitle}</span>
              </>
            ) : null}
          </span>
        </span>
      </span>

      <span className="row-trail">
        <span>
          <span className={`amount tone-${tone}`} style={{ display: "block" }}>
            {isAdd ? "+" : "−"} {formatMoney(amount)}
          </span>
          {runningBalance !== undefined && (
            <span className="num" style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
              bal {formatMoney(runningBalance)}
            </span>
          )}
        </span>

        {onView && (
          <button
            type="button"
            onClick={onView}
            className="row-view"
            aria-label={`View details for ${isAdd ? "add" : "deduct"} of ${formatMoney(amount)} — ${title}`}
          >
            <EyeIcon size={16} />
          </button>
        )}
      </span>
    </div>
  );
}
