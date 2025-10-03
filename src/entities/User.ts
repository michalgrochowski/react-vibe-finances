export type UserId = string;

export interface User {
  id: UserId;
  username: string;
  email: string;
  emailVerified?: string | null; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}


