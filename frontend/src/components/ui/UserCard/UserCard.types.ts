export type UserRole = "user" | "admin";

export interface UserCardData {
  _id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}
