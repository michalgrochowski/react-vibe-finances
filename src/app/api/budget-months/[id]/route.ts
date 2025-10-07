import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateBudgetMonthSchema = z.object({
  salaryOverrideCents: z.number().int().min(0).max(99999900).nullable().optional(),
  savingsCents: z.number().int().min(0).max(99999900).optional(),
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
    const { salaryOverrideCents, savingsCents } = updateBudgetMonthSchema.parse(body);

    // Check if budget month exists and belongs to user
    const existingBudgetMonth = await prisma.budgetMonth.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBudgetMonth) {
      return NextResponse.json({ error: "Budget month not found" }, { status: 404 });
    }

    // Update budget month
    const updatedBudgetMonth = await prisma.budgetMonth.update({
      where: { id },
      data: {
        salaryOverrideCents: salaryOverrideCents !== undefined ? (salaryOverrideCents ? BigInt(salaryOverrideCents) : null) : undefined,
        savingsCents: savingsCents !== undefined ? BigInt(savingsCents) : undefined,
      },
    });

    return NextResponse.json({ 
      message: "Budget month updated successfully",
      budgetMonth: {
        ...updatedBudgetMonth,
        salaryOverrideCents: updatedBudgetMonth.salaryOverrideCents ? Number(updatedBudgetMonth.salaryOverrideCents) : null,
        savingsCents: Number(updatedBudgetMonth.savingsCents),
      }
    });
  } catch (error) {
    console.error("Error updating budget month:", error);
    return NextResponse.json(
      { error: "Failed to update budget month" },
      { status: 500 }
    );
  }
}
