import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITermNotice extends Document {
  district: string;
  object: string;
  reason: string;
  student: Types.ObjectId
}

const TermNoticeSchema = new Schema<ITermNotice>({
  district: { type: String, required: true },
  object: { type: String, required: true },
  reason: { type: String, required: true },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
      unique: true,
    }
}, {timestamps: true});

export const TermNotice = mongoose.model<ITermNotice>("term_notice", TermNoticeSchema);
