/** Shared formatting + ledger semantics. Single source of truth for money & time. */

const TAKA = "\u09F3";

/** Absolute currency string, e.g. ৳1,250. */
export const formatMoney = (n: number) =>
  TAKA + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Compact currency for hero figures, e.g. ৳12.4K — keeps big numbers on one line. */
export const formatMoneyCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs < 100_000) return formatMoney(n);
  return TAKA + (abs / 1000).toFixed(abs >= 1_000_000 ? 2 : 1).replace(/\.0$/, "") +
    (abs >= 1_000_000 ? "M" : "K");
};

export const CURRENCY_SYMBOL = TAKA;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Human relative time: "just now", "4h ago", "Yesterday", "12 Mar". */
export const formatRelative = (input: string | Date) => {
  const date = new Date(input);
  const diff = Date.now() - date.getTime();

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY) return "Yesterday";
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
  });
};

/** Full timestamp for detail views. */
export const formatDateTime = (input: string | Date) =>
  new Date(input).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export type BalanceState = "owed-by-you" | "owed-to-you" | "settled";

/**
 * Ledger convention: a positive balance means you owe them,
 * negative means they owe you.
 */
export const balanceState = (balance: number): BalanceState => {
  if (balance > 0) return "owed-by-you";
  if (balance < 0) return "owed-to-you";
  return "settled";
};

export const BALANCE_LABEL: Record<BalanceState, string> = {
  "owed-by-you": "You owe",
  "owed-to-you": "Owes you",
  settled: "Settled",
};

export const BALANCE_LABEL_LONG: Record<BalanceState, string> = {
  "owed-by-you": "You owe them",
  "owed-to-you": "They owe you",
  settled: "All settled",
};

/** Maps a balance state onto the design-system tone classes. */
export const BALANCE_TONE: Record<BalanceState, "danger" | "success" | "neutral"> = {
  "owed-by-you": "danger",
  "owed-to-you": "success",
  settled: "neutral",
};
