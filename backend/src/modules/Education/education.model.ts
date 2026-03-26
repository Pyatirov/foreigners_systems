import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEducation extends Document {
  institution: string;
  degree: string;
  field_of_study: string;
  graduation_date: Date;
  scanUrl?: string;
  student?: Types.ObjectId
}

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field_of_study: { type: String },
  graduation_date: { type: Date },
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true});

export const Education = mongoose.model<IEducation>("education", EducationSchema);
