import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const PIN_PATTERN = /^\d{4}$/;

/**
 * Changes the ledger PIN. Reachable only with a valid session (the proxy gate
 * does not list this path as public) and still requires the current PIN, so a
 * borrowed session alone cannot lock the owner out.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentPin: unknown = body?.currentPin;
    const newPin: unknown = body?.newPin;

    if (typeof currentPin !== "string" || !PIN_PATTERN.test(currentPin)) {
      return NextResponse.json({ error: "Enter your current 4-digit PIN" }, { status: 400 });
    }
    if (typeof newPin !== "string" || !PIN_PATTERN.test(newPin)) {
      return NextResponse.json({ error: "New PIN must be a 4-digit number" }, { status: 400 });
    }
    if (currentPin === newPin) {
      return NextResponse.json({ error: "New PIN must be different from the current one" }, { status: 400 });
    }

    const settings = await prisma.settings.findFirst();
    if (!settings?.pinHash) {
      return NextResponse.json({ error: "No PIN is set yet" }, { status: 400 });
    }

    if (!bcrypt.compareSync(currentPin, settings.pinHash)) {
      return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 401 });
    }

    await prisma.settings.update({
      where: { id: settings.id },
      data: { pinHash: bcrypt.hashSync(newPin, 10) },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to change PIN:", e);
    return NextResponse.json({ error: "Failed to change PIN" }, { status: 500 });
  }
}
