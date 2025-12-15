import { Request, Response } from "express";
import { Education } from "../models/Education";

// Получение всех документов об образовании
export const getEducation = async (req: Request, res: Response) => {
  try {
    const education = await Education.find();
    res.json(education);
  } catch (error) {
    res.status(500).json({ message: "Error fetching education", error });
  }
};

// Создание документа об образовании
export const createEducation = async (req: Request, res: Response) => {
  try {
    const newEducation = new Education(req.body);
    await newEducation.save();
    res.status(201).json(newEducation);
  } catch (error) {
    res.status(500).json({ message: "Error creating education", error });
  }
};

// Обновление документа об образовании
export const updateEducation = async (req: Request, res: Response) => {
  try {
    const updated = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Education not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating education", error });
  }
};

// Удаление документа об образовании
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const deleted = await Education.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Education not found" });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting education", error });
  }
};
