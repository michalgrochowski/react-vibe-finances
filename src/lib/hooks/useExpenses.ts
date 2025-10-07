import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useExpenses = (monthId: string) => {
  return useQuery({
    queryKey: ["expenses", monthId],
    queryFn: async () => {
      const response = await fetch(`/api/expenses?monthId=${monthId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      return data.expenses;
    },
    enabled: !!monthId,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; amountCents: number; categoryId: string; monthId: string }) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create expense");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch expenses for the month
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.monthId] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; amountCents?: number; categoryId?: string } }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update expense");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate expenses queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate expenses queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
