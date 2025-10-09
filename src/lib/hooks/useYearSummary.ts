import { useQuery } from "@tanstack/react-query";

export const useYearSummary = (year: number) => {
  return useQuery({
    queryKey: ["yearSummary", year],
    queryFn: async () => {
      const response = await fetch(`/api/year-summary?year=${year}`);
      if (!response.ok) {
        throw new Error("Failed to fetch year summary");
      }
      return response.json();
    },
  });
};
