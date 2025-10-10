import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name } = body || {};
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const updated = await prisma.category.update({ where: { id }, data: { name } });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (txCount > 0) {
      return NextResponse.json({ error: "Cannot delete category with transactions" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to delete category" }, { status: 500 });
  }
}
