import { Request, Response } from "express";
import { Petition } from "../models/Petition";
import { MedicalReport } from "@/models/MedicalReport";

export const getMedicalReport = async (req: Request, res: Response) => {
  try {
    const medicalReports = await MedicalReport.find();
    res.json(medicalReports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching medical reports", error });
  }
};

export const createMedicalReport = async (req: Request, res: Response) => {
  try {
    const newMedicalReport = new MedicalReport(req.body);
    await newMedicalReport.save();
    res.status(201).json(newMedicalReport);
  } catch (error) {
    res.status(500).json({ message: "Error creating medical report", error });
  }
};

export const updateMedicalReport = async (req: Request, res: Response) => {
  try {
    const updated = await MedicalReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Medical report not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating medical report", error });
  }
};

export const deleteMedicalReport = async (req: Request, res: Response) => {
  try {
    const deleted = await MedicalReport.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Medical report not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting medical report", error });
  }
};
