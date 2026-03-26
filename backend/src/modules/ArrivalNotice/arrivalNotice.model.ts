import mongoose, { Schema, Document, Types } from "mongoose";

export interface IArrivalNotice extends Document {
  scanUrl?: string;
  student?: Types.ObjectId;
}

const ArrivalNoticeSchema = new Schema<IArrivalNotice>({
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true });  

export const ArrivalNotice = mongoose.model<IArrivalNotice>("arrival_notice", ArrivalNoticeSchema);
