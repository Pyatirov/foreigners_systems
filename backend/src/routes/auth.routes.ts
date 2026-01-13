import { login, logout, refresh, register } from "@/controllers/auth.controller";
import { Router } from "express";

export const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);