export interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}