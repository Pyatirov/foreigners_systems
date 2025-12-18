import mongoose, { Schema, Document, Types } from "mongoose";
import { IEducation } from "./Education";

export interface IMedicalReport extends Document {
  organization: string;
  series: number;
  number: number;
  student: Types.ObjectId
}

const MedicalReportSchema = new Schema<IMedicalReport>({
  organization: { type: String },
  series: { type: Number, required: true },
  number: { type: Number, required: true },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
      unique: true,
    }
}, {timestamps: true});

export const MedicalReport = mongoose.model<IMedicalReport>("medical_report", MedicalReportSchema); 
