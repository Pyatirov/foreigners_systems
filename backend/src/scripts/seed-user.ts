// scripts/seed-user.ts
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import dotenv from "dotenv"

dotenv.config()

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://192.168.1.100:27017/foreigners_systems';

    mongoose.connect(MONGO_URI)
        .then(() => console.log('Mongo connected'))
        .catch(err => console.error('Mongo connection error:', err));

  const exists = await User.findOne({ email: 'test@test.com' });
  if (exists) {
    console.log('User already exists');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  await User.create({
    email: 'test@test.com',
    passwordHash,
    role: 'admin',
    refreshTokens: [],
  });

  console.log('Test user created');
  process.exit(0);
}

seed();
