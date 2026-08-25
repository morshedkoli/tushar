import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const personId = Number(resolvedParams.id);
    if (!Number.isInteger(personId)) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 });
    }

    const data = await req.json();
    const amount = Number(data?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const type = data?.type === "ADD" || data?.type === "DEDUCT" ? data.type : null;
    if (!type) {
      return NextResponse.json({ error: "Type must be ADD or DEDUCT" }, { status: 400 });
    }

    const description = typeof data?.description === "string" ? data.description.trim() : "";

    const result = await prisma.$transaction(async (tx) => {
      const newTx = await tx.transaction.create({
        data: {
          amount,
          type,
          description: description || null,
          personId,
        },
      });

      const balanceChange = type === "ADD" ? amount : -amount;
      const updatedPerson = await tx.person.update({
        where: { id: personId },
        data: {
          balance: { increment: balanceChange },
        },
      });

      return { transaction: newTx, person: updatedPerson };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to process transaction:", error);
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
  }
}
