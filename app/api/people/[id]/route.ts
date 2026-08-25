import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRunningBalances } from "@/app/lib/balances";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 });
    }

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
      },
    });
    if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...person,
      transactions: withRunningBalances(person.balance, person.transactions),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch person" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 });
    }

    const data = await req.json();
    const name = typeof data?.name === "string" ? data.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const phone = typeof data?.phone === "string" ? data.phone.trim() : "";

    const person = await prisma.person.update({
      where: { id },
      data: { name, phone: phone || null },
    });
    return NextResponse.json(person);
  } catch {
    return NextResponse.json({ error: "Failed to update person" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 });
    }

    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
