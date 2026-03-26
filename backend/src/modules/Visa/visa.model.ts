import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVisa extends Document {
  country: string;
  type: string;
  number: string;
  issued_date: Date;
  expiry_date: Date;
  scanUrl?: string;
  student?: Types.ObjectId
}

const VisaSchema = new Schema<IVisa>({
  country: { type: String, required: true },
  type: { type: String, required: true },
  number: { type: String, required: true },
  issued_date: { type: Date },
  expiry_date: { type: Date },
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true});

export const Visa = mongoose.model<IVisa>("visas", VisaSchema);
