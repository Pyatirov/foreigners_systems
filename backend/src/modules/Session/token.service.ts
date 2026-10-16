import "dotenv/config"
import jwt from 'jsonwebtoken';

export type AppRole = 'specialist' | 'admin';

export interface AccessTokenPayload {
  userId: string;
  role: AppRole;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in .env');
}

function isAppRole(value: unknown): value is AppRole {
  return value === "specialist" || value === "admin";
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '10m' });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '14d' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    if (
      typeof payload === 'string' ||
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      !isAppRole(payload.role)
    ) {
      throw new Error('Invalid access token payload');
    }
    return {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    };
  } catch (err) {
    throw new Error('Invalid access token')
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        const payload = jwt.verify(token, REFRESH_SECRET);
        if (
            typeof payload === 'string' ||
            typeof payload.userId !== 'string'
        ) {
            throw new Error('Invalid refresh token payload');
        }
        return {
            userId: payload.userId
        };
    }
    catch (err) {
        throw new Error("Invalid refresh token")
    }
}
