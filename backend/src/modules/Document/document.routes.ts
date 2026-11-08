import { Router } from "express";
import {
  archiveDocument,
  createDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "@/modules/Document/document.controller.js";

export const router = Router();

router.get("/", getDocuments);
router.post("/", createDocument);
router.patch("/:id/archive", archiveDocument);
router.get("/:id", getDocumentById);
router.patch("/:id", updateDocument);
