import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body || {};
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const item = await prisma.category.create({ data: { name } });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to create category" }, { status: 500 });
  }
}
