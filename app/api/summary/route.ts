import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRunningBalances } from "@/app/lib/balances";

const RECENT_LIMIT = 10;

/**
 * Most recent movements across every contact, newest first.
 *
 * Balances are not stored per transaction, so they are reconstructed by walking
 * each involved contact's history back from their current balance. That needs
 * the full history of those contacts, fetched in a single second query rather
 * than one per transaction.
 */
export async function GET() {
  try {
    const recent = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: RECENT_LIMIT,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        date: true,
        personId: true,
        person: { select: { id: true, name: true } },
      },
    });

    if (recent.length === 0) return NextResponse.json([]);

    const personIds = [...new Set(recent.map(tx => tx.personId))];
    const people = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: {
        id: true,
        balance: true,
        transactions: {
          select: { id: true, amount: true, type: true },
          orderBy: { date: "desc" },
        },
      },
    });

    /* transaction id -> the balances surrounding it */
    const balancesByTx = new Map<number, { balanceBefore: number; balanceAfter: number }>();
    for (const person of people) {
      for (const tx of withRunningBalances(person.balance, person.transactions)) {
        balancesByTx.set(tx.id, { balanceBefore: tx.balanceBefore, balanceAfter: tx.balanceAfter });
      }
    }

    const enriched = recent.map(({ personId, ...tx }) => ({
      ...tx,
      ...(balancesByTx.get(tx.id) ?? { balanceBefore: 0, balanceAfter: 0 }),
    }));

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
