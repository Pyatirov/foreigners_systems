import bcrypt from 'bcryptjs'
import { IUser, User } from "../models/User"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './token.service'
import { HydratedDocument, Types } from 'mongoose'
import { Session } from '@/models/Session'
import logger from '@/utils/logger'

export async function loginUser (email: string, password: string, meta: { ip?: string, userAgent: string}) {
    logger.debug({email, ip: meta.ip, userAgent: meta.userAgent}, 'Login attempt')
    
    const user = await User.findOne({email})
    if (!user) {
        logger.warn({email, ip: meta.ip, userAgent: meta.userAgent}, 'Login failed: user not found')
        throw new Error("Unauthorized")
    }  

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
        logger.warn({email, ip: meta.ip, userAgent: meta.userAgent}, 'Login failed: wrong password')
        throw new Error("Unauthorized")
    }

    logger.info({email, ip: meta.ip, userAgent: meta.userAgent}, 'Login success')
    
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role, email: user.email })

    const refreshToken = generateRefreshToken({ userId: user._id.toString() })

    await Session.create({
        userId:    user._id.toString(),
        token:     refreshToken,
        expiresAt: new Date(Date.now() + 14 * 86400_000),
        ...meta
    })

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
    const session = await Session.findOne({ token: refreshToken })
    
    if (!session) {
        logger.warn({userId: payload.userId}, 'Refresh session failed: session not found')
        await Session.deleteMany({userId: payload.userId, ip: meta.ip, userAgent: meta.userAgent });
        throw new Error("Unauthorized")
    }

    logger.info({userId: payload.userId}, 'Refresh session success')
    
    const user = await User.findById(session.userId)

    if (!user) throw new Error("Unauthorized")

    await Session.deleteOne()
    const newRefreshToken = generateRefreshToken({userId: user._id.toString()})

    await Session.create({
        userId: user._id.toString(),
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 14 * 86400_000),
        ...meta
    })

    return {
        accessToken: generateAccessToken({userId: user._id.toString(), role: user.role, email: user.email}), 
        refreshToken: newRefreshToken
    }
}

export async function logoutUser(refreshToken: string) {
  const result = await Session.deleteOne({ token: refreshToken })

  if (result.deletedCount === 0) {
    logger.warn('Logout called with unknown or already deleted token')
  } else {
    logger.info('Session deleted on logout')
  }
}

export async function logoutAllSessions(userId: string) {
    await Session.deleteMany({userId: userId})
}