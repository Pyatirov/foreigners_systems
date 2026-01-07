import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const auth = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) return res.sendStatus(401);

    try {
      const token = header.split(" ")[1];
      const user: any = verifyToken(token);

      if (roles.length && !roles.includes(user.role)) {
        return res.sendStatus(403);
      }

      (req as any).user = user;
      next();
    } catch {
      res.sendStatus(401);
    }
  };
};
