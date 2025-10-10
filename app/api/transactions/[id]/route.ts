import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type TxType = "INCOME" | "EXPENSE";

function deltaFor(type: TxType, amount: number) {
  return type === "INCOME" ? amount : -amount;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newType: TxType = ["INCOME", "EXPENSE"].includes(body?.type) ? body.type : existing.type as TxType;
    const newAmount: number = typeof body?.amount === "number" ? body.amount : existing.amount;
    const newAccountId: number = body?.accountId ? Number(body.accountId) : existing.accountId;
    const newCategoryId: number = body?.categoryId ? Number(body.categoryId) : existing.categoryId;
    const newDescription: string | null = typeof body?.description === "string" ? body.description : existing.description;
    const newDate: Date = body?.date ? new Date(body.date) : existing.date;

    await prisma.$transaction(async (tx) => {
      // Revert old effect
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: deltaFor(existing.type as TxType, existing.amount) } },
      });

      // Apply new effect on possibly new account
      await tx.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: deltaFor(newType, newAmount) } },
      });

      await tx.transaction.update({
        where: { id },
        data: {
          type: newType,
          amount: newAmount,
          accountId: newAccountId,
          categoryId: newCategoryId,
          description: newDescription,
          date: newDate,
        },
      });
    });

    const updated = await prisma.transaction.findUnique({ where: { id }, include: { account: true, category: true } });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Revert effect on account balance
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: deltaFor(existing.type as TxType, existing.amount) } },
      });
      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to delete transaction" }, { status: 500 });
  }
}
