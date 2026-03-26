import { Router } from "express"
import { getVisas, createVisa, updateVisa, deleteVisa } from "@/modules/Visa/visa.controller"

export const router = Router();

router.get("/", getVisas);
router.post("/", createVisa);
router.put("/:id", updateVisa);
router.delete("/:id", deleteVisa);
