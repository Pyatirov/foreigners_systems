import { Request, Response } from "express";
import { MigrationCard } from "@/models/MigrationCard";

export const getMigrationCards = async (req: Request, res: Response) => {
  try {
    const migrationCards = await MigrationCard.find();
    res.json(migrationCards);
  } catch (error) {
    res.status(500).json({ message: "Error fetching migration cards", error });
  }
};

export const createMigrationCard = async (req: Request, res: Response) => {
  try {
    const newMigrationCard = new MigrationCard(req.body);
    await newMigrationCard.save();
    res.status(201).json(newMigrationCard);
  } catch (error) {
    res.status(500).json({ message: "Error creating migration card", error });
  }
};

export const updateMigrationCard = async (req: Request, res: Response) => {
  try {
    const updated = await MigrationCard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Migration card not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating migration card", error });
  }
};

export const deleteMigrationCard = async (req: Request, res: Response) => {
  try {
    const deleted = await MigrationCard.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Migration card not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting migration card", error });
  }
};
