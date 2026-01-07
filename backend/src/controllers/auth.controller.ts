import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  const user = await User.findOne({ username, role });
  if (!user) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const token = signToken({
    id: user._id,
    role: user.role,
  });

  res.json({ token });
};
