import { Router } from "express"
import { createTermNotice, deleteTermNotice, updateTermNotice, getTermNotices } from "@/modules/TermNotice/termNotice.controller.js"

export const router = Router();

router.get("/", getTermNotices);
router.post("/", createTermNotice);
router.put("/:id", updateTermNotice);
router.delete("/:id", deleteTermNotice);