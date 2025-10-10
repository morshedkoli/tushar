import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await _req.json();
    const { name, type, balance } = body || {};

    const data: any = {};
    if (typeof name === "string") data.name = name;
    if (["BANK", "MOBILE_BANKING", "LOAN"].includes(type)) data.type = type;
    if (typeof balance === "number") data.balance = balance;

    const updated = await prisma.account.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const txCount = await prisma.transaction.count({ where: { accountId: id } });
    if (txCount > 0) {
      return NextResponse.json({ error: "Cannot delete account with transactions" }, { status: 400 });
    }

    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to delete account" }, { status: 500 });
  }
}
