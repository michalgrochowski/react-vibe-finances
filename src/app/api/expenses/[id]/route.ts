import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateExpenseSchema = z.object({
  name: z.string().min(1).max(70).optional(),
  amountCents: z.number().int().min(0).max(99999900).optional(), // Max 999,999
  categoryId: z.string().uuid().optional(),
  isPaid: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, amountCents, categoryId, isPaid } = updateExpenseSchema.parse(body);

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // If categoryId is provided, verify it belongs to the user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: id },
      data: {
        name: name,
        amountCents: amountCents !== undefined ? BigInt(amountCents) : undefined,
        categoryId: categoryId,
        isPaid: isPaid,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ 
      message: "Expense updated successfully",
      expense: {
        ...updatedExpense,
        amountCents: Number(updatedExpense.amountCents),
      }
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: id },
    });

    return NextResponse.json({ 
      message: "Expense deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
