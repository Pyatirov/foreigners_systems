import { Router } from "express"
import { getMedicalReport, createMedicalReport, updateMedicalReport, deleteMedicalReport } from "@/modules/MedicalReports/medicalReports.controller"

export const router = Router();

router.get("/", getMedicalReport);
router.post("/", createMedicalReport);
router.put("/:id", updateMedicalReport);
router.delete("/:id", deleteMedicalReport);