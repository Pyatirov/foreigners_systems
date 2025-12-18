import { Router } from "express"
import { createTermNotice, deleteTermNotice, updateTermNotice, getTermNotices } from "../controllers/termNoticeController"

export const router = Router();

router.get("/", getTermNotices);
router.post("/", createTermNotice);
router.put("/:id", updateTermNotice);
router.delete("/:id", deleteTermNotice);