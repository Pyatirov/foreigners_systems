import mongoose, { Schema, Document } from "mongoose";

export interface IPetition extends Document {
  district: string;
  object: string;
  reason: string;
}

const PetitionSchema = new Schema<IPetition>({
  district: { type: String },
  object: { type: String, required: true },
  reason: { type: String, required: true }
});

export const Petition = mongoose.model<IPetition>("petition", PetitionSchema);