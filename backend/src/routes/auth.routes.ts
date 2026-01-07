import { Router } from "express";

export const router = Router();

router.post("/registration");
router.post("/login");
router.post("/logout");
router.get("/activate:link");
router.get("/refresh");
router.get("/users");
