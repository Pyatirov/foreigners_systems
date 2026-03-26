import { Router } from "express"
import { getPassports, createPassport, updatePassport, deletePassport } from "@/modules/Passport/passport.controller"

export const router = Router();

router.get("/", getPassports);
router.post("/", createPassport);
router.put("/:id", updatePassport);
router.delete("/:id", deletePassport);

