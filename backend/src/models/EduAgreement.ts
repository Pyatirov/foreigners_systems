import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEduAgreement extends Document {
  number: number;
  student: Types.ObjectId;
}

const EduAgreementSchema = new Schema<IEduAgreement>({
  number: { type: Number, required: true },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true
    }
}, {timestamps: true});

export const EduAgreement = mongoose.model<IEduAgreement>("edu_agreement", EduAgreementSchema);
