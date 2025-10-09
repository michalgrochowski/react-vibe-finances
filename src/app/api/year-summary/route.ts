import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Get user's first tracked month to limit navigation
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { firstTrackedMonth: true }
    });

    const firstTrackedYear = profile?.firstTrackedMonth ? 
      new Date(profile.firstTrackedMonth).getFullYear() : 
      new Date().getFullYear();

    // Get all budget months for the selected year
    const budgetMonths = await prisma.budgetMonth.findMany({
      where: {
        userId: session.user.id,
        month: {
          startsWith: year.toString()
        }
      },
      include: {
        expenses: {
          include: {
            category: true
          }
        }
      }
    });

    // Calculate total expenses by category and individual expenses
    const categoryTotals = new Map<string, { name: string; amount: number }>();
    const individualExpenses: { name: string; amount: number }[] = [];
    let totalExpenses = 0;

    budgetMonths.forEach(budgetMonth => {
      budgetMonth.expenses.forEach(expense => {
        const amount = Number(expense.amountCents) / 100;
        totalExpenses += amount;

        // Add to individual expenses
        individualExpenses.push({
          name: expense.name,
          amount: amount
        });

        // Add to category totals
        const categoryName = expense.category.name;
        if (categoryTotals.has(categoryName)) {
          categoryTotals.get(categoryName)!.amount += amount;
        } else {
          categoryTotals.set(categoryName, {
            name: categoryName,
            amount: amount
          });
        }
      });
    });

    // Process category data - group categories < 500 PLN into "Other"
    const processedCategoryData = Array.from(categoryTotals.values())
      .map(category => ({
        name: category.name,
        amount: category.amount,
        isOther: category.amount < 500
      }))
      .sort((a, b) => b.amount - a.amount);

    // Group small categories into "Other"
    const otherCategories = processedCategoryData.filter(item => item.isOther);
    const mainCategories = processedCategoryData.filter(item => !item.isOther);

    const otherTotal = otherCategories.reduce((sum, item) => sum + item.amount, 0);
    
    const categoryData = [...mainCategories];
    if (otherTotal > 0) {
      categoryData.push({
        name: "Other",
        amount: otherTotal,
        isOther: false
      });
    }

    // Process individual expenses data - group expenses < 500 PLN into "Other"
    const processedExpenseData = individualExpenses
      .map(expense => ({
        name: expense.name,
        amount: expense.amount,
        isOther: expense.amount < 500
      }))
      .sort((a, b) => b.amount - a.amount);

    // Group small expenses into "Other"
    const otherExpenses = processedExpenseData.filter(item => item.isOther);
    const mainExpenses = processedExpenseData.filter(item => !item.isOther);

    const otherExpensesTotal = otherExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    const expenseData = [...mainExpenses];
    if (otherExpensesTotal > 0) {
      expenseData.push({
        name: "Other",
        amount: otherExpensesTotal,
        isOther: false
      });
    }

    // Calculate total savings for the year
    const totalSavings = budgetMonths.reduce((sum, month) => 
      sum + Number(month.savingsCents) / 100, 0
    );

    // Get monthly data for the months grid
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const monthString = `${year}-${String(index + 1).padStart(2, '0')}`;
      const budgetMonth = budgetMonths.find(bm => bm.month === monthString);
      
      return {
        month: new Date(year, index).toLocaleString('default', { month: 'long' }),
        monthNumber: index + 1,
        hasData: !!budgetMonth,
        totalExpenses: budgetMonth ? 
          budgetMonth.expenses.reduce((sum, expense) => sum + Number(expense.amountCents) / 100, 0) : 0
      };
    });

    return NextResponse.json({
      year,
      firstTrackedYear,
      categoryData: categoryData.map(item => ({
        name: item.name,
        amount: Math.round(item.amount * 100) / 100 // Round to 2 decimal places
      })),
      expenseData: expenseData.map(item => ({
        name: item.name,
        amount: Math.round(item.amount * 100) / 100 // Round to 2 decimal places
      })),
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      monthlyData
    });

  } catch (error) {
    console.error("Error fetching year summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch year summary" },
      { status: 500 }
    );
  }
}
