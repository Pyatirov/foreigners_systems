import { login, logout, refresh, register } from "@/modules/Auth/auth.controller.js";
import { Router } from "express";

export const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);