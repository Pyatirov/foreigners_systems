import { Schema, model } from "mongoose";

export interface IRefreshToken {
  token: string
  createdAt: Date
  expiresAt: Date
  userAgent?: string
  ip?: string
}

export const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  userAgent: { type: String },
  ip: { type: String}
},
{ 
  _id: false
})
