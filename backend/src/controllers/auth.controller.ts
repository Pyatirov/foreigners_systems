import { Request, Response } from "express";
import { loginUser, refreshSession } from "@/services/auth.service";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await loginUser(email, password, { ip: req.ip, userAgent: req.headers["user-agent"]! })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/auth/refresh"
  })

  res.json({accessToken})
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) return res.sendStatus(401)
  
  const tokens = await refreshSession(refreshToken, {
    ip: req.ip,
    userAgent: req.headers["user-agent"]!
  })

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/auth/refresh"
  })

  res.json({ accessToken: tokens.accessToken })
}
