import "dotenv/config"
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

console.log('ACCESS_SECRET:', ACCESS_SECRET);
console.log('REFRESH_SECRET:', REFRESH_SECRET);


if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in .env');
}

export function generateAccessToken(payload: { userId: string; role: string; email: string }) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '10m' });
}

export function generateRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string) {
  try {
    // throws если токен невалиден или истёк
    const payload = jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string; email: string };
    return payload
  } catch (err) {
    throw new Error('Invalid access token')
  }
}

export function verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, REFRESH_SECRET) as { userId: string }
    }
    catch (err) {
        throw new Error("Invalid refresh token")
    }
}
