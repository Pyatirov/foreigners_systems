import { Router } from "express"
import { createArrivalNotice, deleteArrivalNotice, getArrivalNotices, updateArrivalNotice } from "../ArrivalNotice/arrivalNotice.controller"

export const router = Router();

router.get("/", getArrivalNotices);
router.post("/", createArrivalNotice);
router.put("/:id", updateArrivalNotice);
router.delete("/:id", deleteArrivalNotice);