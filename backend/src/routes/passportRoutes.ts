import { Router } from "express"
import { getPassports, createPassport, updatePassport, deletePassport } from "../controllers/passportController"

export const router = Router();

router.get("/", getPassports);
router.post("/", createPassport);
router.put("/:id", updatePassport);
router.delete("/:id", deletePassport);

