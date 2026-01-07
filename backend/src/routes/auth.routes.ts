import { Router } from "express";
import { login } from "../controllers/auth.controller";

export const router = Router();

router.post("/login", login);
