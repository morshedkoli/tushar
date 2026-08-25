import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * People are returned "most recently active first" so the contacts you just
 * transacted with sit at the top of every list. Contacts with no transactions
 * fall to the bottom, alphabetically.
 */
export async function GET() {
  try {
    const people = await prisma.person.findMany({
      include: {
        transactions: {
          select: { date: true },
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    const withActivity = people.map(({ transactions, ...person }) => ({
      ...person,
      lastActivity: transactions[0]?.date ?? null,
    }));

    const sorted = [...withActivity].sort((a, b) => {
      if (a.lastActivity && b.lastActivity) {
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
      if (a.lastActivity) return -1;
      if (b.lastActivity) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const name = typeof data?.name === "string" ? data.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const phone = typeof data?.phone === "string" ? data.phone.trim() : "";
    const balance = Number(data?.balance);

    const person = await prisma.person.create({
      data: {
        name,
        phone: phone || null,
        balance: Number.isFinite(balance) ? balance : 0,
      },
    });
    return NextResponse.json({ ...person, lastActivity: null });
  } catch {
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}
