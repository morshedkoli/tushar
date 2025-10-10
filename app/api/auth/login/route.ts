import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin: string | undefined = body?.pin;
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be a 4-digit number" }, { status: 400 });
    }

    const settings = await prisma.settings.findFirst();
    if (!settings?.pinHash) {
      return NextResponse.json({ error: "PIN not set" }, { status: 400 });
    }

    const valid = bcrypt.compareSync(pin, settings.pinHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", "1", { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
