import { User } from "./User.js";
import bcrypt from "bcryptjs";

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  const page  = params?.page  ?? 1;
  const limit = params?.limit ?? 20;
  const skip  = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find().select("-passwordHash -refreshTokens").skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  return { items, total };
}

export async function getUserById(id: string) {
  const user = await User.findById(id).select("-passwordHash -refreshTokens").lean();
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUser(id: string, data: { email?: string; role?: string; password?: string }) {
  const update: Record<string, any> = {};

  if (data.email)    update.email = data.email;
  if (data.role)     update.role  = data.role;
  if (data.password) update.passwordHash = await bcrypt.hash(data.password, 10);

  const user = await User.findByIdAndUpdate(id, update, { new: true })
    .select("-passwordHash -refreshTokens")
    .lean();

  if (!user) throw new Error("User not found");
  return user;
}

export async function deleteUser(id: string) {
  const result = await User.findByIdAndDelete(id);
  if (!result) throw new Error("User not found");
}