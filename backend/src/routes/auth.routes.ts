import { login, refresh } from "@/controllers/auth.controller";
import { Router } from "express";

export const router = Router();

// router.post("/registration");
router.post("/login", login);
// router.post("/logout");
router.get("/refresh", refresh);