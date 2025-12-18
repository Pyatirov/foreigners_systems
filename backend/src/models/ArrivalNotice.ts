import mongoose, { Schema, Document, Types } from "mongoose";

export interface IArrivalNotice extends Document {
  notification: string;
  student: Types.ObjectId;
}

const ArrivalNoticeSchema = new Schema<IArrivalNotice>({
  notification: { type: String, required: true },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
      unique: true,
    }
}, {timestamps: true });

export const ArrivalNotice = mongoose.model<IArrivalNotice>("arrival_notice", ArrivalNoticeSchema);
