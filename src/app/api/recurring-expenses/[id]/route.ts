import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateRecurringExpenseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amountCents: z.number().int().min(0).optional(),
  startsOn: z.string().datetime().optional(),
  endsOn: z.string().datetime().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const data = updateRecurringExpenseSchema.parse(body);

    // Check ownership
    const existing = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amountCents !== undefined) updateData.amountCents = data.amountCents;
    if (data.startsOn !== undefined) updateData.startsOn = new Date(data.startsOn);
    if (data.endsOn !== undefined) updateData.endsOn = data.endsOn ? new Date(data.endsOn) : null;
    if (data.active !== undefined) updateData.active = data.active;

    const expense = await prisma.recurringExpense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...expense,
      amountCents: Number(expense.amountCents),
    });
  } catch (error) {
    console.error("Update recurring expense error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check ownership
    const existing = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete recurring expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
