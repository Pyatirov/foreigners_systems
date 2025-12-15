import { Router } from "express"
import { getVisas, createVisa, updateVisa, deleteVisa } from "../controllers/visaController"

export const router = Router();

router.get("/", getVisas);
router.post("/", createVisa);
router.put("/:id", updateVisa);
router.delete("/:id", deleteVisa);
