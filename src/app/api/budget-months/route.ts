import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBudgetMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // Format: "2025-10"
  salaryOverrideCents: z.number().int().min(0).max(99999900).optional(),
  savingsCents: z.number().int().min(0).max(99999900).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { month, salaryOverrideCents, savingsCents } = createBudgetMonthSchema.parse(body);

    // Check if budget month already exists
    const existingBudgetMonth = await prisma.budgetMonth.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month: month,
        },
      },
    });

    if (existingBudgetMonth) {
      return NextResponse.json({ 
        message: "Budget month already exists",
        budgetMonth: {
          ...existingBudgetMonth,
          salaryOverrideCents: existingBudgetMonth.salaryOverrideCents ? Number(existingBudgetMonth.salaryOverrideCents) : null,
          savingsCents: Number(existingBudgetMonth.savingsCents),
        }
      });
    }

    // Create new budget month
    const budgetMonth = await prisma.budgetMonth.create({
      data: {
        userId: session.user.id,
        month: month,
        salaryOverrideCents: salaryOverrideCents ? BigInt(salaryOverrideCents) : null,
        savingsCents: savingsCents ? BigInt(savingsCents) : BigInt(0),
      },
    });

    return NextResponse.json({ 
      message: "Budget month created successfully",
      budgetMonth: {
        ...budgetMonth,
        salaryOverrideCents: budgetMonth.salaryOverrideCents ? Number(budgetMonth.salaryOverrideCents) : null,
        savingsCents: Number(budgetMonth.savingsCents),
      }
    });
  } catch (error) {
    console.error("Error creating budget month:", error);
    return NextResponse.json(
      { error: "Failed to create budget month" },
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
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json({ error: "Month parameter is required" }, { status: 400 });
    }

    const budgetMonth = await prisma.budgetMonth.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month: month,
        },
      },
    });

    return NextResponse.json({ 
      budgetMonth: budgetMonth ? {
        ...budgetMonth,
        salaryOverrideCents: budgetMonth.salaryOverrideCents ? Number(budgetMonth.salaryOverrideCents) : null,
        savingsCents: Number(budgetMonth.savingsCents),
      } : null
    });
  } catch (error) {
    console.error("Error fetching budget month:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget month" },
      { status: 500 }
    );
  }
}
