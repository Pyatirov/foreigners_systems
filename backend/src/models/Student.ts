import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  photoUrl?: string;
  lastname: string;
  firstname: string;
  middlename: string;
  birthdate: Date;
  country: string;
  sex: boolean;
}

const StudentSchema = new Schema<IStudent>({
  photoUrl: { type: String },
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  middlename: { type: String },
  birthdate: { type: Date, required: true },
  country: { type: String },
  sex: { type: Boolean, required: true },
});

export const Student = mongoose.model<IStudent>("students", StudentSchema);
