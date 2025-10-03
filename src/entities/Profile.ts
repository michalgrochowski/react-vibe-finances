export interface Profile {
  userId: string;
  displayName?: string | null;
  themePref: "light" | "dark" | "system";
  defaultSalaryCents: bigint;
  firstTrackedMonth: string; // ISO date (YYYY-MM-01)
  createdAt: string;
  updatedAt: string;
}


