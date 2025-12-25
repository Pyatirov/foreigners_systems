import mongoose, { Schema, Document, Types } from "mongoose";
import { IEducation } from "./Education";

export interface IMedicalReport extends Document {
  organization: string;
  series: number;
  number: number;
  scanUrl?: string;
  student?: Types.ObjectId
}

const MedicalReportSchema = new Schema<IMedicalReport>({
  organization: { type: String },
  series: { type: Number, required: true },
  number: { type: Number, required: true },
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true});

export const MedicalReport = mongoose.model<IMedicalReport>("medical_report", MedicalReportSchema); 
