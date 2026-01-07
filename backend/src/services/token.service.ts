import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export function generateAccessToken(payload: {userId: string, role: string}) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '10m' })
}

export function generateRefreshToken(payload: {userId: string}) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" })
}

export function verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, REFRESH_SECRET) as { userId: string }
    }
    catch (err) {
        throw new Error("Invalid refresh token")
    }
}