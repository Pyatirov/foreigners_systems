import type { Request, Response } from "express";
import { loginUser, logoutUser, refreshSession, registerUser, AuthError } from "@/modules/Auth/auth.service.js";
import logger from "@/logger/logger.js";

const REFRESH_COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    path: "/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE
  });
}

function sendError(res: Response, error: unknown): void {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  logger.error({err: error}, "Authentication request failed");

  res.status(500).json({ message: "Internal server error" });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  if (password.length < 8 || password.length > 72) {
    res.status(400).json({ message: "Password must be between 8 and 72 characters" });
    return;
  }

  try {
    const user = await registerUser(normalizedEmail, password);
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    sendError(res, error);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim() === "" ||
    !password
  ) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const tokens = await loginUser(email, password, { ip: req.ip, userAgent: req.headers["user-agent"] });

    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ accessToken: tokens.accessToken });
    } catch (error) {
    console.error("LOGIN ERROR:", error);

    if (error instanceof Error) {
      console.error("MESSAGE:", error.message);
      console.error("STACK:", error.stack);
    }

    sendError(res, error);
  }
}


export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  if (typeof refreshToken !== "string" || !refreshToken) {
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }

  try {
    const tokens = await refreshSession(refreshToken, {ip: req.ip, userAgent: req.headers["user-agent"]});
    setRefreshTokenCookie(res, tokens.refreshToken);
    res.json({accessToken: tokens.accessToken});
  } catch (error) {
    if (error instanceof AuthError && error.statusCode === 401) {
      res.clearCookie("refreshToken", { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/auth" });
    }
    sendError(res, error);
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  try {
    if (typeof refreshToken === "string" && refreshToken) {
      await logoutUser(refreshToken);
    }
    res.clearCookie("refreshToken", { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/auth" });
    res.sendStatus(204);
  } catch (error) {
    sendError(res, error);
  }
}