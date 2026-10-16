import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  verifyAccessToken,
  type AppRole,
  type AccessTokenPayload,
} from "@/modules/Session/token.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.sendStatus(401);
  }
}

export function requireRole(...roles: AppRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.sendStatus(403);
      return;
    }

    next();
  };
}