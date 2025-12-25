import { Request, Response } from "express";
import { Petition } from "@/models/Petition";

export const getPetitions = async (req: Request, res: Response) => {
  try {
    const petitions = await Petition.find();
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching petitions", error });
  }
};

export const createPetition = async (req: Request, res: Response) => {
  try {
    console.log("CREATE", req.body)
    const newPetition = new Petition(req.body);
    await newPetition.save();
    res.status(201).json(newPetition);
  } catch (error) {
    console.log("ERROR", error)
    res.status(500).json({ message: "Error creating petition", error });
  }
};

export const updatePetition = async (req: Request, res: Response) => {
  try {
    const updated = await Petition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Petition not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating petition", error });
  }
};

export const deletePetition = async (req: Request, res: Response) => {
  try {
    const deleted = await Petition.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Petition not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting petition", error });
  }
};
