import { Router } from "express"
import { getEducation, createEducation, updateEducation, deleteEducation } from "@/modules/Education/education.controller.js"

export const router = Router();

router.get("/", getEducation);
router.post("/", createEducation);
router.put("/:id", updateEducation);
router.delete("/:id", deleteEducation);
