import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  userId: z.string().optional(),
});

const addMembersSchema = z.object({
  members: z.array(z.string().min(1)),
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

    const members = await prisma.member.findMany({
      where: { eventId },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
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

    // Support both single member and batch member addition
    if (body.members && Array.isArray(body.members)) {
      const validatedData = addMembersSchema.parse(body);

      const members = await Promise.all(
        validatedData.members.map((name) =>
          prisma.member.create({
            data: {
              name,
              eventId,
            },
          })
        )
      );

      return NextResponse.json({ members }, { status: 201 });
    } else {
      const validatedData = addMemberSchema.parse(body);

      const member = await prisma.member.create({
        data: {
          name: validatedData.name,
          eventId,
          userId: validatedData.userId,
        },
      });

      return NextResponse.json({ member }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    }

    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
