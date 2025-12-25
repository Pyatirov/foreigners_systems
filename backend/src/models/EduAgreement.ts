import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEduAgreement extends Document {
  number: number;
  scanUrl?: string;
  student?: Types.ObjectId;
}

const EduAgreementSchema = new Schema<IEduAgreement>({
  number: { type: Number, required: true },
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true});

export const EduAgreement = mongoose.model<IEduAgreement>("edu_agreement", EduAgreementSchema);
