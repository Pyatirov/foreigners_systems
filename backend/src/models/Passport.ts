import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPassport extends Document {
  type: string;
  series: number;
  number: number,
  valid_from: Date,
  valid_to: Date,
  student: Types.ObjectId
}

const StudentSchema = new Schema<IPassport>({
  type: { type: String, required: true },
  series: { type: Number },
  number: { type: Number, required: true },
  valid_from: { type: Date },
  valid_to: { type: Date},
  student: {
    type: Schema.Types.ObjectId,
    ref: "students",
    required: true,
    unique: true,
  }
}, {timestamps: true});

export const Passport = mongoose.model<IPassport>("passports", StudentSchema);
