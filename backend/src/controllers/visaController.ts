import { Request, Response } from "express";
import { Visa } from "../models/Visa";

// Получение всех виз
export const getVisas = async (req: Request, res: Response) => {
  try {
    const visas = await Visa.find();
    res.json(visas);
  } catch (error) {
    res.status(500).json({ message: "Error fetching visas", error });
  }
};

// Создание визы
export const createVisa = async (req: Request, res: Response) => {
  try {
    const newVisa = new Visa(req.body);
    await newVisa.save();
    res.status(201).json(newVisa);
  } catch (error) {
    res.status(500).json({ message: "Error creating visa", error });
  }
};

// Обновление визы
export const updateVisa = async (req: Request, res: Response) => {
  try {
    const updated = await Visa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Visa not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating visa", error });
  }
};

// Удаление визы
export const deleteVisa = async (req: Request, res: Response) => {
  try {
    const deleted = await Visa.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Visa not found" });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting visa", error });
  }
};
