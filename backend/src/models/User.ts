import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "specialist"],
    required: true,
  },
});

export const User = model("User", UserSchema);
