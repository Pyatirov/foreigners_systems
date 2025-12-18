import { Request, Response } from "express";
import { TermNotice } from "@/models/TermNotice";

export const getTermNotices = async (req: Request, res: Response) => {
  try {
    const termNotices = await TermNotice.find();
    res.json(termNotices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching termination notices", error });
  }
};

export const createTermNotice = async (req: Request, res: Response) => {
  try {
    const newTermNotice = new TermNotice(req.body);
    await newTermNotice.save();
    res.status(201).json(newTermNotice);
  } catch (error) {
    res.status(500).json({ message: "Error creating termination notice", error });
  }
};

export const updateTermNotice = async (req: Request, res: Response) => {
  try {
    const updated = await TermNotice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Termination notice not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating termination notice", error });
  }
};

export const deleteTermNotice = async (req: Request, res: Response) => {
  try {
    const deleted = await TermNotice.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Termination notice not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting termination notice", error });
  }
};
