import type { CategoryId } from "./Category";

export type BudgetMonthId = string;
export type ExpenseId = string;

export interface Expense {
  id: ExpenseId;
  userId: string;
  monthId: BudgetMonthId;
  name: string;
  amountCents: bigint;
  categoryId: CategoryId;
  origin: "recurring" | "manual";
  createdAt: string;
  updatedAt: string;
}


