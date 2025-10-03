import type { CategoryId } from "./Category";

export type RecurringExpenseId = string;

export interface RecurringExpense {
  id: RecurringExpenseId;
  userId: string;
  name: string;
  amountCents: bigint;
  categoryId: CategoryId;
  active: boolean;
  startsOn: string; // ISO date
  endsOn?: string | null; // ISO date
  createdAt: string;
  updatedAt: string;
}


