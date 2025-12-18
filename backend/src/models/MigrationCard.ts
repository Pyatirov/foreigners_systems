import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMigrationCard extends Document {
  series: number;
  number: number;
  start_date: Date;
  end_date: Date;
  student: Types.ObjectId
}

const MigrationCardSchema = new Schema<IMigrationCard>({
  series: { type: Number, required: true },
  number: { type: Number, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  student: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
      unique: true,
    }
}, {timestamps: true});

export const MigrationCard = mongoose.model<IMigrationCard>("migration_card", MigrationCardSchema);
