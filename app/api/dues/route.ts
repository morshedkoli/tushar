import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "RECEIVABLE" | "PAYABLE" | null;
    const status = searchParams.get("status") as "OPEN" | "SETTLED" | null;
    const contactId = searchParams.get("contactId");

    const where: any = {};
    if (type && ["RECEIVABLE", "PAYABLE"].includes(type)) where.type = type;
    if (status && ["OPEN", "SETTLED"].includes(status)) where.status = status;
    if (contactId) where.contactId = Number(contactId);

    const dues = await prisma.due.findMany({
      where,
      orderBy: { date: "desc" },
      include: { contact: true, settlement: true },
    });
    return NextResponse.json(dues);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch dues" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, date, contactId } = body || {};

    if (!type || !["RECEIVABLE", "PAYABLE"].includes(type)) return NextResponse.json({ error: "invalid type" }, { status: 400 });
    if (typeof amount !== "number" || amount <= 0) return NextResponse.json({ error: "amount must be positive number" }, { status: 400 });
    if (!contactId) return NextResponse.json({ error: "contactId required" }, { status: 400 });

    const created = await prisma.due.create({
      data: {
        type,
        amount,
        description: description || null,
        date: date ? new Date(date) : undefined,
        contactId: Number(contactId),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to create due" }, { status: 500 });
  }
}
