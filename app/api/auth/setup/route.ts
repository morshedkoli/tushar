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
    if (settings?.pinHash) {
      return NextResponse.json({ error: "PIN already set" }, { status: 400 });
    }

    const pinHash = bcrypt.hashSync(pin, 10);

    if (!settings) {
      await prisma.settings.create({ data: { pinHash } });
    } else {
      await prisma.settings.update({ where: { id: settings.id }, data: { pinHash } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to set PIN" }, { status: 500 });
  }
}
