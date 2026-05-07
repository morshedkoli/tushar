import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const person = await prisma.person.findUnique({
      where: { id: Number(resolvedParams.id) },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        }
      }
    });
    if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch person" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await req.json();
    const person = await prisma.person.update({
      where: { id: Number(resolvedParams.id) },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });
    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update person" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.person.delete({
      where: { id: Number(resolvedParams.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
