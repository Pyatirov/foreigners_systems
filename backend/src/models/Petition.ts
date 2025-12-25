import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPetition extends Document {
  district: string;
  object: string;
  reason: string;
  scanUrl?: string;
  student?: Types.ObjectId
}

const PetitionSchema = new Schema<IPetition>({
  district: { type: String },
  object: { type: String, required: true },
  reason: { type: String, required: true },
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true});

export const Petition = mongoose.model<IPetition>("petition", PetitionSchema);