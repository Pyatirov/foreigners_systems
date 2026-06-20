import type { Request, Response } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "./user.service.js";
import { registerUser } from "@/modules/Auth/auth.service.js"; // create через уже готовый register

export async function getAll(req: Request, res: Response) {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await getAllUsers({ page, limit });
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const user = await getUserById(req.params.id);
  res.json(user);
}

export async function create(req: Request, res: Response) {
  const { email, password, role } = req.body;
  const user = await registerUser(email, password, role ?? "user");
  res.status(201).json(user);
}

export async function update(req: Request, res: Response) {
  const user = await updateUser(req.params.id, req.body);
  res.json(user);
}

export async function remove(req: Request, res: Response) {
  await deleteUser(req.params.id);
  res.sendStatus(204);
}