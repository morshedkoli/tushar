import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(contacts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body || {};
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const contact = await prisma.contact.create({ data: { name } });
    return NextResponse.json(contact, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to create contact" }, { status: 500 });
  }
}
