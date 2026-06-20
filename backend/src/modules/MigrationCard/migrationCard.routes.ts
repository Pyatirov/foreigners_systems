import { Router } from "express"
import { createMigrationCard, deleteMigrationCard, getMigrationCards, updateMigrationCard } from "@/modules/MigrationCard/migrationCard.controller.js"

export const router = Router();

router.get("/", getMigrationCards);
router.post("/", createMigrationCard);
router.put("/:id", updateMigrationCard);
router.delete("/:id", deleteMigrationCard);