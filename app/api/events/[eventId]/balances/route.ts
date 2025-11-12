import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBalances } from "@/lib/balances";

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
      include: {
        members: true,
        transactions: {
          include: {
            paidBy: true,
            splits: {
              include: {
                member: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const balances = calculateBalances(event.members, event.transactions);

    return NextResponse.json({ balances });
  } catch (error) {
    console.error("Error calculating balances:", error);
    return NextResponse.json(
      { error: "Failed to calculate balances" },
      { status: 500 }
    );
  }
}
