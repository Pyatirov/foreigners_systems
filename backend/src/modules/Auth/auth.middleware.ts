import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { pool } from "@/connectDB.js";

export type AppRole = "specialist" | "admin";

export interface AuthenticatedUser {
  id: string;
  role: AppRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_ROLES = new Set<AppRole>(["specialist", "admin"]);

/**
 * Keep this resolver aligned with the secret used by the existing access-token signer.
 * JWT_ACCESS_SECRET is the preferred environment variable name; the other names support
 * common existing configurations without requiring a token format change.
 */
function getAccessTokenSecret(): string | undefined {
  return process.env.JWT_ACCESS_SECRET
    ?? process.env.JWT_ACCESS_TOKEN_SECRET
    ?? process.env.ACCESS_TOKEN_SECRET
    ?? process.env.JWT_SECRET;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function identityFromPayload(payload: JwtPayload): { id?: string; login?: string } {
  const nestedUser = payload.user as { id?: unknown; login?: unknown; email?: unknown } | undefined;
  const candidates = [payload.sub, payload.userId, payload.id, nestedUser?.id];
  const id = candidates
    .map(asString)
    .find((candidate) => candidate && UUID_REGEX.test(candidate));

  const login = [payload.login, payload.email, nestedUser?.login, nestedUser?.email, payload.sub]
    .map(asString)
    .find((candidate) => candidate && !UUID_REGEX.test(candidate));

  return { id, login };
}

/**
 * Validates the bearer access token and reloads the current role from PostgreSQL.
 * Role claims embedded in JWT are deliberately not trusted, so role changes apply
 * immediately and a removed user cannot keep using an unexpired token.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.header("Authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ message: "Требуется авторизация" });
    return;
  }

  const secret = getAccessTokenSecret();
  if (!secret) {
    console.error("Access token secret is not configured");
    res.status(500).json({ message: "Ошибка конфигурации авторизации" });
    return;
  }

  let payload: JwtPayload;
  try {
    const decoded = jwt.verify(match[1], secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string") {
      res.status(401).json({ message: "Недействительный токен доступа" });
      return;
    }
    payload = decoded;
    if (payload.tokenType === "refresh" || payload.type === "refresh") {
      res.status(401).json({ message: "Недействительный токен доступа" });
      return;
    }
  } catch {
    res.status(401).json({ message: "Недействительный или истёкший токен доступа" });
    return;
  }

  const identity = identityFromPayload(payload);
  if (!identity.id && !identity.login) {
    res.status(401).json({ message: "В токене отсутствует идентификатор пользователя" });
    return;
  }

  try {
    const result = identity.id
      ? await pool.query<{ id: string; role: string }>(
          `SELECT id, role FROM app.users WHERE id = $1 LIMIT 1`,
          [identity.id]
        )
      : await pool.query<{ id: string; role: string }>(
          `SELECT id, role FROM app.users WHERE login = $1 LIMIT 1`,
          [identity.login]
        );

    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ message: "Пользователь не найден или доступ отозван" });
      return;
    }

    if (!ALLOWED_ROLES.has(user.role as AppRole)) {
      res.status(403).json({ message: "Роль пользователя не имеет доступа к системе" });
      return;
    }

    req.authUser = { id: user.id, role: user.role as AppRole };
    next();
  } catch (error) {
    console.error("Failed to load authenticated user from PostgreSQL:", error);
    res.status(500).json({ message: "Не удалось проверить права пользователя" });
  }
}

/** Middleware for route-level authorization; authenticate must run first. */
export function requireRole(...allowedRoles: AppRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.authUser) {
      res.status(401).json({ message: "Требуется авторизация" });
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      res.status(403).json({ message: "Недостаточно прав для выполнения операции" });
      return;
    }

    next();
  };
}


/** Default-deny policy for physical DELETE endpoints across the API. */
export const requireAdminForDelete: RequestHandler = (req, res, next) => {
  if (req.method !== "DELETE") {
    next();
    return;
  }

  if (!req.authUser) {
    res.status(401).json({ message: "Требуется авторизация" });
    return;
  }

  if (req.authUser.role !== "admin") {
    res.status(403).json({ message: "Физическое удаление доступно только администратору" });
    return;
  }

  next();
};
