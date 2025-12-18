import { Router } from "express"
import { createArrivalNotice, deleteArrivalNotice, getArrivalNotices, updateArrivalNotice } from "../controllers/arrivalNoticeController"

export const router = Router();

router.get("/", getArrivalNotices);
router.post("/", createArrivalNotice);
router.put("/:id", updateArrivalNotice);
router.delete("/:id", deleteArrivalNotice);