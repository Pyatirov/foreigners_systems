// models/Session.ts
import mongoose, { Schema, Document, Types, InferSchemaType } from 'mongoose'

const SessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token:  { type: String, required: true, unique: true },
  ip:         { type: String },
  userAgent:  { type: String },
  createdAt:  { type: Date, default: Date.now },
  expiresAt:  { type: Date, required: true, index: { expireAfterSeconds: 0 } }
})

export type Session = InferSchemaType<typeof SessionSchema>
export const Session = mongoose.model('Session', SessionSchema)