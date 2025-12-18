import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPetition extends Document {
  district: string;
  object: string;
  reason: string;
  student: Types.ObjectId
}

const PetitionSchema = new Schema<IPetition>({
  district: { type: String },
  object: { type: String, required: true },
  reason: { type: String, required: true },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true
    }
}, {timestamps: true});

export const Petition = mongoose.model<IPetition>("petition", PetitionSchema);