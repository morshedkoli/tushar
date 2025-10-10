import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.settings.findFirst();
  const hasPin = Boolean(settings?.pinHash);
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const authenticated = Boolean(session);
  return NextResponse.json({ hasPin, authenticated });
}
