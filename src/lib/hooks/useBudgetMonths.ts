import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useBudgetMonth = (month: string) => {
  return useQuery({
    queryKey: ["budgetMonth", month],
    queryFn: async () => {
      const response = await fetch(`/api/budget-months?month=${encodeURIComponent(month)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch budget month");
      }
      const data = await response.json();
      return data.budgetMonth;
    },
    enabled: !!month,
  });
};

export const useCreateBudgetMonth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { month: string; salaryOverrideCents?: number; savingsCents?: number }) => {
      const response = await fetch("/api/budget-months", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create budget month");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Set the data directly in the cache to prevent refetch
      queryClient.setQueryData(["budgetMonth", variables.month], data.budgetMonth);
    },
  });
};
