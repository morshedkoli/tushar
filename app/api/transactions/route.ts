import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to apply balance delta based on transaction type
function applyDelta(type: "INCOME" | "EXPENSE", amount: number) {
  return type === "INCOME" ? amount : -amount;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: any = {};
    if (type && ["INCOME", "EXPENSE"].includes(type)) where.type = type;
    if (categoryId) where.categoryId = Number(categoryId);
    if (accountId) where.accountId = Number(accountId);
    if (start || end) where.date = {
      ...(start ? { gte: new Date(start) } : {}),
      ...(end ? { lte: new Date(end) } : {}),
    };

    const items = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { account: true, category: true },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, date, accountId, categoryId } = body || {};

    if (!type || !["INCOME", "EXPENSE"].includes(type)) return NextResponse.json({ error: "invalid type" }, { status: 400 });
    if (typeof amount !== "number" || amount <= 0) return NextResponse.json({ error: "amount must be positive number" }, { status: 400 });
    if (!accountId || !categoryId) return NextResponse.json({ error: "accountId and categoryId required" }, { status: 400 });

    const created = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          type,
          amount,
          description: description || null,
          date: date ? new Date(date) : undefined,
          accountId: Number(accountId),
          categoryId: Number(categoryId),
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: Number(accountId) },
        data: { balance: { increment: applyDelta(type, amount) } },
      });

      return t;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to create transaction" }, { status: 500 });
  }
}
