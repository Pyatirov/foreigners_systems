import { Router } from "express";
import {
  deleteDocumentType,
  deleteDocumentTypeField,
  getDocumentTypeByCode,
  getDocumentTypes,
  patchDocumentType,
  patchDocumentTypeField,
  postDocumentType,
  postDocumentTypeField,
} from "@/modules/DocumentType/documentType.controller.js";

export const router = Router();

// Collection routes must be registered before the /:code route.
router.get("/", getDocumentTypes);
router.post("/", postDocumentType);

router.get("/:code", getDocumentTypeByCode);
router.patch("/:code", patchDocumentType);
router.delete("/:code", deleteDocumentType); // soft-deactivation, no physical delete

router.post("/:code/fields", postDocumentTypeField);
router.patch("/:code/fields/:fieldId", patchDocumentTypeField);
router.delete("/:code/fields/:fieldId", deleteDocumentTypeField); // soft-deactivation
