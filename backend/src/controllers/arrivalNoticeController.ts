import { Request, Response } from "express";
import { ArrivalNotice } from "@/models/ArrivalNotice";

export const getArrivalNotices = async (req: Request, res: Response) => {
  try {
    const arrivalNotices = await ArrivalNotice.find();
    res.json(arrivalNotices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching arrival notices", error });
  }
};

export const createArrivalNotice = async (req: Request, res: Response) => {
  try {
    const newArrivalNotice = new ArrivalNotice(req.body);
    await newArrivalNotice.save();
    res.status(201).json(newArrivalNotice);
  } catch (error) {
    res.status(500).json({ message: "Error creating arrival notice", error });
  }
};

export const updateArrivalNotice = async (req: Request, res: Response) => {
  try {
    const updated = await ArrivalNotice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Arrival notice not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating arrival notice", error });
  }
};

export const deleteArrivalNotice = async (req: Request, res: Response) => {
  try {
    const deleted = await ArrivalNotice.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Arrival notice not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting arrival notice", error });
  }
};
