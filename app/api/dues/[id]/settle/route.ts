import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const body = await request.json();
    const { accountId, categoryId, description, date, amount } = body || {};

    if (!accountId || !categoryId) {
      return NextResponse.json({ error: "accountId and categoryId required" }, { status: 400 });
    }
    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const due = await prisma.due.findUnique({ where: { id } });
    if (!due) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (due.status !== "OPEN") return NextResponse.json({ error: "Already settled" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // Create the settlement transaction
      const txType = due.type === "RECEIVABLE" ? "INCOME" : "EXPENSE";
      const settleAmount = typeof amount === "number" ? amount : due.amount;
      if (settleAmount > due.amount) {
        throw new Error("Settlement amount cannot exceed due amount");
      }
      const t = await tx.transaction.create({
        data: {
          type: txType,
          amount: settleAmount,
          description: description ?? `Settle ${due.type.toLowerCase()} with contact ${due.contactId}`,
          date: date ? new Date(date) : undefined,
          accountId: Number(accountId),
          categoryId: Number(categoryId),
        },
      });

      // Update account balance like normal transaction handler does
      const delta = txType === "INCOME" ? settleAmount : -settleAmount;
      await tx.account.update({ where: { id: Number(accountId) }, data: { balance: { increment: delta } } });

      // If fully settled, mark settled and link transaction; else reduce amount and keep OPEN
      if (settleAmount === due.amount) {
        await tx.due.update({
          where: { id },
          data: { status: "SETTLED", settlementTransactionId: t.id },
        });
      } else {
        await tx.due.update({
          where: { id },
          data: { amount: { decrement: settleAmount } },
        });
      }

      return t;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message || "Failed to settle due";
    const status = msg.includes("exceed due amount") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
