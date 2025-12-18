import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVisa extends Document {
  country: string;
  type: string;
  number: string;
  issued_date: Date;
  expiry_date: Date;
  student: Types.ObjectId
}

const VisaSchema = new Schema<IVisa>({
  country: { type: String, required: true },
  type: { type: String, required: true },
  number: { type: String, required: true },
  issued_date: { type: Date },
  expiry_date: { type: Date },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true
    }
}, {timestamps: true});

export const Visa = mongoose.model<IVisa>("visas", VisaSchema);
