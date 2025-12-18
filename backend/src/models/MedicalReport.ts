import mongoose, { Schema, Document } from "mongoose";
import { IEducation } from "./Education";

export interface IMedicalReport extends Document {
  organization: string;
  series: number;
  number: number;
}

const MedicalReportSchema = new Schema<IMedicalReport>({
  organization: { type: String },
  series: { type: Number, required: true },
  number: { type: Number, required: true }
});

export const MedicalReport = mongoose.model<IMedicalReport>("medical_report", MedicalReportSchema); 
