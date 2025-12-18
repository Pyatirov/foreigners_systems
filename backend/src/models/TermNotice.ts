import mongoose, { Schema, Document } from "mongoose";

export interface ITermNotice extends Document {
  district: string;
  object: string;
  reason: string;
}

const TermNoticeSchema = new Schema<ITermNotice>({
  district: { type: String, required: true },
  object: { type: String, required: true },
  reason: { type: String, required: true }
});

export const TermNotice = mongoose.model<ITermNotice>("term_notice", TermNoticeSchema);
