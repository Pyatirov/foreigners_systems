import { Request, Response } from "express";
import { loginUser, logoutUser, refreshSession, registerUser } from "@/services/auth.service";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await loginUser(email, password, { ip: req.ip, userAgent: req.headers["user-agent"]! })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/auth"
  })

  res.json({accessToken})
}

export async function register(req: Request, res: Response) {
  const { email, password, role } = req.body;

  const user = await registerUser(email, password, role);
  res.status(201).json({ message: "User registered", user });
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
    secure: false,
    sameSite: "lax",
    path: "/auth"
  })

  res.json({ accessToken: tokens.accessToken })
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await logoutUser(refreshToken);
  }
  res.clearCookie("refreshToken", { path: "/auth/refresh" });
  res.sendStatus(204);
}