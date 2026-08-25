/** Signed effect a movement has on a ledger balance. */
export const transactionDelta = (type: "ADD" | "DEDUCT", amount: number) =>
  type === "ADD" ? amount : -amount;

interface Movement {
  amount: number;
  type: "ADD" | "DEDUCT";
}

/**
 * Reconstructs the balance on either side of each movement by walking backwards
 * from the person's current balance.
 *
 * `movements` must be newest-first — the same order the API returns — so the
 * first entry is the one that produced today's balance.
 */
export function withRunningBalances<T extends Movement>(
  currentBalance: number,
  movements: readonly T[],
): (T & { balanceBefore: number; balanceAfter: number })[] {
  let after = currentBalance;

  return movements.map(movement => {
    const before = after - transactionDelta(movement.type, movement.amount);
    const enriched = { ...movement, balanceBefore: before, balanceAfter: after };
    after = before;
    return enriched;
  });
}
