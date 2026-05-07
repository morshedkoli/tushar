import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const people = await prisma.person.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const person = await prisma.person.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        balance: data.balance || 0,
      },
    });
    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}
