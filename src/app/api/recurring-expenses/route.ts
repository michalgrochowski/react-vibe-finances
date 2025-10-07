import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRecurringExpenseSchema = z.object({
  name: z.string().min(1).max(70),
  amountCents: z.number().int().min(0).max(99999900), // Max 999,999
  categoryId: z.string().uuid(),
  startsOn: z.string().datetime().optional(),
  endsOn: z.string().datetime().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expenses = await prisma.recurringExpense.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      expenses.map((exp) => ({
        ...exp,
        amountCents: Number(exp.amountCents),
      }))
    );
  } catch (error) {
    console.error("Get recurring expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createRecurringExpenseSchema.parse(body);

    // Verify category ownership
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || category.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const expense = await prisma.recurringExpense.create({
      data: {
        userId: session.user.id,
        name: data.name,
        amountCents: data.amountCents,
        categoryId: data.categoryId,
        startsOn: data.startsOn ? new Date(data.startsOn) : new Date(),
        endsOn: data.endsOn ? new Date(data.endsOn) : null,
        active: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...expense,
      amountCents: Number(expense.amountCents),
    });
  } catch (error) {
    console.error("Create recurring expense error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
