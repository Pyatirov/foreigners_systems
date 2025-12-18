import { Router } from "express"
import { createMigrationCard, deleteMigrationCard, getMigrationCards, updateMigrationCard } from "@/controllers/migrationCardController"

export const router = Router();

router.get("/", getMigrationCards);
router.post("/", createMigrationCard);
router.put("/:id", updateMigrationCard);
router.delete("/:id", deleteMigrationCard);