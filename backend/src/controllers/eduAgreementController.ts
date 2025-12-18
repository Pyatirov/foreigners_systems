import { Request, Response } from "express";
import { EduAgreement } from "@/models/EduAgreement";

export const getEduAgreements = async (req: Request, res: Response) => {
  try {
    const eduAgreements = await EduAgreement.find();
    res.json(eduAgreements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching education agreements", error });
  }
};

export const createEduAgreement = async (req: Request, res: Response) => {
  try {
    const newEduAgreement = new EduAgreement(req.body);
    await newEduAgreement.save();
    res.status(201).json(newEduAgreement);
  } catch (error) {
    res.status(500).json({ message: "Error creating education agreement", error });
  }
};

export const updateEduAgreement = async (req: Request, res: Response) => {
  try {
    const updated = await EduAgreement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Education agreement not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating education agreement", error });
  }
};

export const deleteEduAgreement = async (req: Request, res: Response) => {
  try {
    const deleted = await EduAgreement.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Education agreement not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting education agreement", error });
  }
};
