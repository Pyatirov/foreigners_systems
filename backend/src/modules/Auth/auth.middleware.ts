import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/modules/Session/token.service.js";

// Расширяем тип Request чтобы хранить payload
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string; email: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.sendStatus(401);
  }
};

export const requireRole = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };