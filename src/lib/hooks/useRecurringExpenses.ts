import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type RecurringExpense = {
  id: string;
  userId: string;
  name: string;
  amountCents: number;
  categoryId: string;
  active: boolean;
  startsOn: string;
  endsOn: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
};

type CreateRecurringExpenseData = {
  name: string;
  amountCents: number;
  categoryId: string;
  startsOn?: string;
  endsOn?: string | null;
};

type UpdateRecurringExpenseData = {
  id: string;
  name?: string;
  amountCents?: number;
  categoryId?: string;
  startsOn?: string;
  endsOn?: string | null;
  active?: boolean;
};

export function useRecurringExpenses() {
  return useQuery<RecurringExpense[]>({
    queryKey: ["recurring-expenses"],
    queryFn: async () => {
      const res = await fetch("/api/recurring-expenses");
      if (!res.ok) throw new Error("Failed to fetch recurring expenses");
      return res.json();
    },
  });
}

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecurringExpenseData) => {
      const res = await fetch("/api/recurring-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create recurring expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateRecurringExpenseData) => {
      const res = await fetch(`/api/recurring-expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update recurring expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recurring-expenses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete recurring expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });
}


