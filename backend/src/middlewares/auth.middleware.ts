import { verifyRefreshToken } from "@/services/token.service";
import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header) return res.sendStatus(401)

  // const token = header.split('')[1]

  // const payload = verifyAccessToken(token)

  // req.user = payload

  // next()
}
