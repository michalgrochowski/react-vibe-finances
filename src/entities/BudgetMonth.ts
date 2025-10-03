export type BudgetMonthId = string;

export interface BudgetMonth {
  id: BudgetMonthId;
  userId: string;
  month: string; // ISO date (YYYY-MM-01)
  salaryOverrideCents?: bigint | null;
  savingsCents: bigint;
  createdAt: string;
  updatedAt: string;
}


