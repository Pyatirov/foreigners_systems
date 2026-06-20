import { Router } from "express"
import { createEduAgreement, deleteEduAgreement, getEduAgreements, updateEduAgreement } from "@/modules/EduAgreement/eduAgreement.controller.js"

export const router = Router();

router.get("/", getEduAgreements);
router.post("/", createEduAgreement);
router.put("/:id", updateEduAgreement);
router.delete("/:id", deleteEduAgreement);

router.get("/test", (req, res) => {
  res.send("OK");
});
