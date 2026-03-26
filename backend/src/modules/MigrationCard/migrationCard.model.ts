import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMigrationCard extends Document {
  series: number;
  number: number;
  start_date: Date;
  end_date: Date;
  scanUrl?: string;
  student?: Types.ObjectId
}

const MigrationCardSchema = new Schema<IMigrationCard>({
  series: { type: Number, required: true },
  number: { type: Number, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  scanUrl: { type: String },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      default: null
    }
}, {timestamps: true});

export const MigrationCard = mongoose.model<IMigrationCard>("migration_card", MigrationCardSchema);
