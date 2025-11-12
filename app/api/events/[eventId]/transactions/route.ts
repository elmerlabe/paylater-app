import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTransactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  paidById: z.string().min(1, "Paid by is required"),
  splits: z.array(
    z.object({
      memberId: z.string(),
      amount: z.number().positive(),
    })
  ).min(1, "At least one split is required"),
  date: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        createdById: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: { eventId },
      include: {
        paidBy: true,
        splits: {
          include: {
            member: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        createdById: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Verify the sum of splits equals the total amount
    const splitsTotal = validatedData.splits.reduce(
      (sum, split) => sum + split.amount,
      0
    );

    if (Math.abs(splitsTotal - validatedData.amount) > 0.01) {
      return NextResponse.json(
        { error: "Sum of splits must equal the total amount" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: validatedData.description,
        amount: validatedData.amount,
        paidById: validatedData.paidById,
        eventId,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        splits: {
          create: validatedData.splits.map((split) => ({
            memberId: split.memberId,
            amount: split.amount,
          })),
        },
      },
      include: {
        paidBy: true,
        splits: {
          include: {
            member: true,
          },
        },
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
