import { User } from '@/entities/User';
import { Profile } from '@/entities/Profile';
import { BudgetMonth } from '@/entities/BudgetMonth';
import { Category } from '@/entities/Category';
import { Expense } from '@/entities/Expense';
import { RecurringExpense } from '@/entities/RecurringExpense';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: null,
  image: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProfile: Profile = {
  id: 'test-profile-id',
  userId: 'test-user-id',
  firstTrackedMonth: '2024-01',
  monthlySalaryCents: 500000, // 5000 PLN
  monthlySavingsGoalCents: 100000, // 1000 PLN
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    userId: 'test-user-id',
    name: 'Groceries',
    color: '#4CAF50',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-2',
    userId: 'test-user-id',
    name: 'Transport',
    color: '#2196F3',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-3',
    userId: 'test-user-id',
    name: 'Entertainment',
    color: '#FF9800',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockBudgetMonth: BudgetMonth = {
  id: 'budget-month-1',
  userId: 'test-user-id',
  month: '2024-10',
  salaryOverrideCents: null,
  savingsCents: 50000, // 500 PLN
  createdAt: new Date('2024-10-01'),
  updatedAt: new Date('2024-10-01'),
};

export const mockExpenses: Expense[] = [
  {
    id: 'expense-1',
    userId: 'test-user-id',
    budgetMonthId: 'budget-month-1',
    categoryId: 'cat-1',
    name: 'Weekly groceries',
    amountCents: 35000, // 350 PLN
    date: new Date('2024-10-05'),
    isPaid: true,
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: 'expense-2',
    userId: 'test-user-id',
    budgetMonthId: 'budget-month-1',
    categoryId: 'cat-2',
    name: 'Monthly bus pass',
    amountCents: 10000, // 100 PLN
    date: new Date('2024-10-01'),
    isPaid: true,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'expense-3',
    userId: 'test-user-id',
    budgetMonthId: 'budget-month-1',
    categoryId: 'cat-3',
    name: 'Cinema tickets',
    amountCents: 8000, // 80 PLN
    date: new Date('2024-10-15'),
    isPaid: false,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
  },
];

export const mockRecurringExpenses: RecurringExpense[] = [
  {
    id: 'recurring-1',
    userId: 'test-user-id',
    categoryId: 'cat-2',
    name: 'Netflix Subscription',
    amountCents: 4500, // 45 PLN
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'recurring-2',
    userId: 'test-user-id',
    categoryId: 'cat-1',
    name: 'Internet',
    amountCents: 6000, // 60 PLN
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

