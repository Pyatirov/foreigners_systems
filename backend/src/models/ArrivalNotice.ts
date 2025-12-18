import mongoose, { Schema, Document } from "mongoose";

export interface IArrivalNotice extends Document {
  notification: string;
}

const ArrivalNoticeSchema = new Schema<IArrivalNotice>({
  notification: { type: String, required: true }
});

export const ArrivalNotice = mongoose.model<IArrivalNotice>("arrival_notice", ArrivalNoticeSchema);
