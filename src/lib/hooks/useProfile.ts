import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Profile = {
  userId: string;
  displayName: string | null;
  themePref: string;
  defaultSalaryCents: number;
  firstTrackedMonth: string;
  createdAt: string;
  updatedAt: string;
};

type UpdateProfileData = {
  defaultSalaryCents?: number;
  firstTrackedMonth?: string;
  themePref?: "light" | "dark" | "system";
};

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
