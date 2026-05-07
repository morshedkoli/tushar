import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await req.json();
    const amount = Number(data.amount);
    const type = data.type as 'ADD' | 'DEDUCT';
    
    const result = await prisma.$transaction(async (tx) => {
      const newTx = await tx.transaction.create({
        data: {
          amount,
          type,
          description: data.description || null,
          personId: Number(resolvedParams.id),
        },
      });

      const balanceChange = type === 'ADD' ? amount : -amount;
      const updatedPerson = await tx.person.update({
        where: { id: Number(resolvedParams.id) },
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
