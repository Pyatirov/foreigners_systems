import { Router } from "express";
import { getAll, getById, create, update, remove } from "./user.controller.js";
import { authenticate, requireRole } from "../Auth/auth.middleware.js";

export const userRouter = Router();

// Все маршруты только для авторизованных админов
userRouter.use(authenticate, requireRole("admin"));

userRouter.get("/",       getAll);
userRouter.get("/:id",    getById);
userRouter.post("/",      create);
userRouter.put("/:id",    update);
userRouter.delete("/:id", remove);