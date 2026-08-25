"use client";
import Link from "next/link";
import type { Person } from "../lib/types";
import {
  BALANCE_LABEL,
  BALANCE_TONE,
  balanceState,
  formatMoney,
  formatRelative,
} from "../lib/format";
import { ChevronRightIcon, PhoneIcon } from "./icons";

/**
 * One contact in a ledger list. Used by both the dashboard and /people so the
 * two lists can never drift apart visually.
 */
export default function PersonRow({
  person,
  showChevron = false,
  showPhone = false,
}: {
  person: Person;
  showChevron?: boolean;
  showPhone?: boolean;
}) {
  const state = balanceState(person.balance);
  const tone = BALANCE_TONE[state];
  const initial = person.name.charAt(0).toUpperCase();

  /* Activity recency is the row's secondary line — it's why the list is sorted this way. */
  const meta = person.lastActivity
    ? formatRelative(person.lastActivity)
    : showPhone && person.phone
      ? person.phone
      : "No activity yet";

  return (
    <Link href={`/people/${person.id}`} className="row">
      <span className="row-main">
        <span className={`avatar avatar-lg avatar-${tone}`} aria-hidden="true">
          {initial}
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="row-name truncate" style={{ display: "block" }}>
            {person.name}
          </span>
          <span className="row-meta truncate">
            {!person.lastActivity && showPhone && person.phone ? <PhoneIcon size={13} /> : null}
            {meta}
            {showPhone && person.phone && person.lastActivity ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{person.phone}</span>
              </>
            ) : null}
          </span>
        </span>
      </span>

      <span className="row-trail">
        <span>
          <span className={`amount tone-${tone}`} style={{ display: "block" }}>
            {formatMoney(person.balance)}
          </span>
          <span className={`badge-${tone}`} style={{ marginTop: 2 }}>
            {BALANCE_LABEL[state]}
          </span>
        </span>
        {showChevron && (
          <span className="tone-neutral" style={{ display: "flex" }}>
            <ChevronRightIcon />
          </span>
        )}
      </span>
    </Link>
  );
}
