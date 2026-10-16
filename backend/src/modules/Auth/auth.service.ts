import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { pool } from '@/connectDB.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type AppRole } from '../Session/token.service.js'
import logger from '@/logger/logger.js'

const REFRESH_TTL_MS = 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds

type UserRow = {
    id: string;
    email: string;
    password_hash: string;
    role: AppRole;
}

type PublicUser = {
    id: string;
    email: string;
    role: AppRole;
}

type RequestMeta = {
    ip?: string;
    userAgent?: string;
}

export class AuthError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function isUniqueViolationError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === '23505'
    );
}

function toPublicUser(userRow: UserRow): PublicUser {
    return {
        id: userRow.id,
        email: userRow.email,
        role: userRow.role,
    };
}

export async function registerUser(email: string, password: string): Promise<PublicUser> {
    const normalizedEmail = normalizeEmail(email);
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const result = await pool.query<UserRow>(
            `INSERT INTO app.users (
                login, 
                password_hash
            ) 
            VALUES ($1, $2) 
            RETURNING 
                id, 
                login AS email, 
                password_hash, 
                role`,
            [normalizedEmail, passwordHash]
        );

        const user = result.rows[0];

        logger.info(`User registered: ${user.id} (${user.email})`);
        return toPublicUser(user);
    } catch (error) {
        if (isUniqueViolationError(error)) {
            throw new AuthError(409, 'User with this email already exists');
        }
        throw new AuthError(500, 'Failed to register user');
    }
}

export async function loginUser(email: string, password: string, meta: RequestMeta) {
    const normalizedEmail = normalizeEmail(email);

    logger.debug(`Login attempt for email: ${normalizedEmail}, IP: ${meta.ip}, User-Agent: ${meta.userAgent}`);

    const result = await pool.query<UserRow>(
        `SELECT 
            id, 
            login AS email, 
            password_hash, 
            role 
        FROM app.users 
        WHERE login = $1
        LIMIT 1`,
        [normalizedEmail]
    );

    const user = result.rows[0];

    if (!user) {
        logger.warn(`Login failed: User not found for email: ${normalizedEmail}, IP: ${meta.ip}`);
        throw new AuthError(401, 'Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        logger.warn(`Login failed: Incorrect password for user: ${user.id}, IP: ${meta.ip}`);
        throw new AuthError(401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

    await pool.query(
        `INSERT INTO app.sessions (
            user_id, 
            refresh_token_hash,
            ip,
            user_agent,
            expires_at 
        ) 
        VALUES ($1, $2, $3, $4, $5)`,
        [user.id, refreshTokenHash, meta.ip ?? null, meta.userAgent ?? null, expiresAt]
    );

    logger.info(`User logged in: ${user.id}`);

    return {
        accessToken,
        refreshToken,
    };
}

export async function refreshSession(refreshToken: string, meta: RequestMeta) {
    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    } catch (error) {
        logger.warn(`Token refresh failed: Invalid refresh token`);
        throw new AuthError(401, 'Invalid refresh token');
    }

    const oldTokenHash = hashRefreshToken(refreshToken);

    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query('BEGIN');
        transactionStarted = true;
        const result = await client.query<{ id: string, email: string, role: AppRole; }>(
            `SELECT 
                u.id, 
                u.login AS email, 
                u.role
            FROM app.sessions AS s
            JOIN app.users AS u 
                ON s.user_id = u.id
            WHERE s.refresh_token_hash = $1
                AND s.user_id = $2
                AND s.expires_at > CURRENT_TIMESTAMP
                FOR UPDATE OF s`,
            [oldTokenHash, payload.userId]
        );

        const user = result.rows[0];

        if (!user) {
            logger.warn(`Token refresh failed: Session not found or expired for user: ${payload.userId}`);
            throw new AuthError(401, 'Invalid refresh token');
        }

        await client.query(
            `DELETE FROM app.sessions 
            WHERE refresh_token_hash = $1`,
            [oldTokenHash]
        );

        const newRefreshToken = generateRefreshToken({ userId: user.id });
        const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

        await client.query(
            `INSERT INTO app.sessions (
                user_id, 
                refresh_token_hash,
                ip,
                user_agent,
                expires_at 
            ) 
            VALUES ($1, $2, $3, $4, $5)`,
            [user.id, newRefreshTokenHash, meta.ip ?? null, meta.userAgent ?? null, expiresAt]
        );

        await client.query('COMMIT');
        transactionStarted = false;

        logger.info(`Session refreshed successfully for user: ${user.id}`);

        return {
            accessToken: generateAccessToken({
                userId: user.id,
                role: user.role,
                email: user.email,
            }),
            refreshToken: newRefreshToken,
        };
    } catch (error) {
        if (transactionStarted) {
            await client.query('ROLLBACK').catch(() => undefined);
        }
        throw error;
    } finally {
        client.release();
    }
}

export async function logoutUser(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const result = await pool.query(
        `DELETE FROM app.sessions 
        WHERE refresh_token_hash = $1`,
        [refreshTokenHash]
    );

    if (result.rowCount === 0) {
        logger.warn(`Logout failed: Session not found for provided refresh token`);
        throw new AuthError(401, 'Invalid refresh token');
    } else {
        logger.info(`Session deleted on logout for refresh token hash: ${refreshTokenHash}`);
    }
}

export async function logoutAllSessions(userId: string): Promise<void> {
    await pool.query(
        `DELETE FROM app.sessions 
        WHERE user_id = $1`,
        [userId]
    );

    logger.info(`All sessions deleted for user: ${userId}`);
}