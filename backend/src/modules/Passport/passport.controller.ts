import type { Request, Response } from "express";
import { Passport } from "./passport.model.js";

export const getPassports = async (req: Request, res: Response) => {
  const { student } = req.query;
  const query = student ? { student } : {};
  const passports = await Passport.find(query);
  res.json(passports);
};

// Создание паспорта
export const createPassport = async (req: Request, res: Response) => {
  try {
    const newPassport = new Passport(req.body);
    await newPassport.save();
    res.status(201).json(newPassport);
  } catch (error) {
    res.status(500).json({ message: "Error creating passport", error });
  }
};

// Обновление паспорта
export const updatePassport = async (req: Request, res: Response) => {
  try {
    const updated = await Passport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Passport not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating passport", error });
  }
};

// Удаление паспорта
export const deletePassport = async (req: Request, res: Response) => {
  try {
    const deleted = await Passport.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Passport not found" });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting passport", error });
  }
};
