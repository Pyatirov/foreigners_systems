import { ObjectId, Schema, model } from "mongoose";
import { IRefreshToken, RefreshTokenSchema } from "./Token"

export interface IUser {
  _id: ObjectId,
  email: string,
  passwordHash: string,
  role: "admin" | "user",
  refreshTokens: IRefreshToken[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: [ "user", "admin"], default: "user", required: true },
  refreshTokens: { type: [RefreshTokenSchema], default: [] }
},
{ 
  timestamps: true 
});

export const User = model<IUser>("User", UserSchema);
