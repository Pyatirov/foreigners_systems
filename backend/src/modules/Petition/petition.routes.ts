import { Router } from "express"
import { getPetitions, createPetition, updatePetition, deletePetition } from "@/modules/Petition/petition.controller"

export const router = Router();

router.get("/", getPetitions);
router.post("/", createPetition);
router.put("/:id", updatePetition);
router.delete("/:id", deletePetition);