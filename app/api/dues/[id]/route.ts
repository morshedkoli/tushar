import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type DueStatus = "OPEN" | "SETTLED";

async function ensureOpen(status: DueStatus) {
  if (status !== "OPEN") {
    throw new Error("Only OPEN dues can be modified or deleted");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const body = await request.json();

    const existing = await prisma.due.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await ensureOpen(existing.status as DueStatus);

    const data: any = {};
    if (["RECEIVABLE", "PAYABLE"].includes(body?.type)) data.type = body.type;
    if (typeof body?.amount === "number") data.amount = body.amount;
    if (typeof body?.description === "string") data.description = body.description;
    if (body?.date) data.date = new Date(body.date);
    if (body?.contactId) data.contactId = Number(body.contactId);

    const updated = await prisma.due.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e: any) {
    const msg = e?.message || "Failed to update due";
    if (msg.includes("Only OPEN")) return NextResponse.json({ error: msg }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);

    const existing = await prisma.due.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await ensureOpen(existing.status as DueStatus);

    await prisma.due.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message || "Failed to delete due";
    if (msg.includes("Only OPEN")) return NextResponse.json({ error: msg }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
