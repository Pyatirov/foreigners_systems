import mongoose, { Schema, Document } from "mongoose";

export interface IEduAgreement extends Document {
  number: number;
}

const EduAgreementSchema = new Schema<IEduAgreement>({
  number: { type: Number, required: true },
});

export const EduAgreement = mongoose.model<IEduAgreement>("edu_agreement", EduAgreementSchema);
