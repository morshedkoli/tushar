"use client";
import { useEffect } from "react";

export const LEDGER_REFRESH_EVENT = "ledger:refresh";

/** Broadcast that ledger data changed (e.g. a contact was added from the global FAB). */
export const emitLedgerRefresh = () => {
  window.dispatchEvent(new Event(LEDGER_REFRESH_EVENT));
};

/** Re-run `onRefresh` whenever ledger data changes elsewhere in the app. */
export function useLedgerRefresh(onRefresh: () => void) {
  useEffect(() => {
    window.addEventListener(LEDGER_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(LEDGER_REFRESH_EVENT, onRefresh);
  }, [onRefresh]);
}
