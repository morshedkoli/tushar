import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(accounts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, balance } = body || {};
    if (!name || !type || typeof balance !== "number") {
      return NextResponse.json({ error: "name, type, balance required" }, { status: 400 });
    }
    if (!["BANK", "MOBILE_BANKING", "LOAN"].includes(type)) {
      return NextResponse.json({ error: "invalid account type" }, { status: 400 });
    }
    const account = await prisma.account.create({ data: { name, type, balance } });
    return NextResponse.json(account, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to create account" }, { status: 500 });
  }
}
