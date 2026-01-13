import bcrypt from 'bcryptjs'
import { IUser, User } from "../models/User"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './token.service'
import { HydratedDocument } from 'mongoose'

export async function loginUser (email: string, password: string, meta: { ip?: string, userAgent: string}) {
    const user = await User.findOne({email})
    if (!user) throw new Error("Unauthorized")

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new Error("Unauthorized")

    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role, email: user.email })

    const refreshToken = generateRefreshToken({ userId: user._id.toString() })

    user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 86400_000),
        ...meta
    })

    await user.save()

    return {accessToken, refreshToken}

}

export async function registerUser(email: string, password: string, role: string) {
    const existing = await User.findOne({email})
    if (existing) throw new Error("User already exists")

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
        email,
        passwordHash,
        role,
        refreshTokens: []
    })

    return {
        id: user._id,
        email: user.email,
        role: user.role
    }
}

export async function refreshSession(refreshToken: string, meta: { ip?: string, userAgent: string }) {
    const payload = verifyRefreshToken(refreshToken)

    const user: HydratedDocument<IUser> | null = await User.findById(payload.userId)
    if (!user) throw new Error("Unauthorized")
    
    const stored = user.refreshTokens.find(t => t.token === refreshToken)

    if (!stored) {
        user.refreshTokens = []
        await user.save()
        throw new Error("Unauthorized")
    }

    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken)

    const newRefresh = generateRefreshToken({userId: user._id.toString()})

    user.refreshTokens.push({
        token: newRefresh,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 86400_000),
        ...meta
    })

    await user.save()

    return {
    accessToken: generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    }),
    refreshToken: newRefresh,
  }
}

export async function logoutUser(refreshToken: string) {
    const user = await User.findOne({"refreshTokens.token": refreshToken});
    if (!user) return;
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    await user.save();
}