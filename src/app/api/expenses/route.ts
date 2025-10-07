import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createExpenseSchema = z.object({
  name: z.string().min(1).max(70),
  amountCents: z.number().int().min(0).max(99999900), // Max 999,999
  categoryId: z.string().uuid(),
  monthId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, amountCents, categoryId, monthId } = createExpenseSchema.parse(body);

    // Verify the budget month belongs to the user
    const budgetMonth = await prisma.budgetMonth.findFirst({
      where: {
        id: monthId,
        userId: session.user.id,
      },
    });

    if (!budgetMonth) {
      return NextResponse.json({ error: "Budget month not found" }, { status: 404 });
    }

    // Verify the category belongs to the user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        monthId: monthId,
        name: name,
        amountCents: BigInt(amountCents),
        categoryId: categoryId,
        origin: "manual",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ 
      message: "Expense created successfully",
      expense: {
        ...expense,
        amountCents: Number(expense.amountCents),
      }
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthId = searchParams.get("monthId");

    if (!monthId) {
      return NextResponse.json({ error: "Month ID parameter is required" }, { status: 400 });
    }

    // Verify the budget month belongs to the user
    const budgetMonth = await prisma.budgetMonth.findFirst({
      where: {
        id: monthId,
        userId: session.user.id,
      },
    });

    if (!budgetMonth) {
      return NextResponse.json({ error: "Budget month not found" }, { status: 404 });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        monthId: monthId,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ 
      expenses: expenses.map(expense => ({
        ...expense,
        amountCents: Number(expense.amountCents),
      }))
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
