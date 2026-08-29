import { Request, Response } from "express";
import { findAgentByMobile } from "../repository/agentRepository";
import { getAgentById, sanitizeAgent } from "../service/agentService";
import { verifyPassword, signToken, verifyToken } from "../service/authService";
import { AuthError, LoginPayload } from "../types/agent";

const COOKIE_NAME = "hashti_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 روز

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { mobile, password } = req.body as LoginPayload;

    if (!mobile || !password) {
      res.status(400).json({ error: "شماره موبایل و رمز عبور الزامی است." });
      return;
    }

    const agent = await findAgentByMobile(mobile);
    if (!agent) {
      res.status(401).json({ error: "شماره موبایل یا رمز عبور اشتباه است." });
      return;
    }

    if (!agent.isActive) {
      res.status(403).json({ error: "حساب کاربری شما غیرفعال شده است." });
      return;
    }

    const isMatch = await verifyPassword(password, agent.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "شماره موبایل یا رمز عبور اشتباه است." });
      return;
    }

    const token = signToken(agent.id);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    res.status(200).json({
      message: "ورود با موفقیت انجام شد.",
      agent: sanitizeAgent(agent),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "خطای سرور در فرآیند ورود." });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
      return;
    }

    const agentId = verifyToken(token);
    const agent = await getAgentById(agentId);

    res.status(200).json({ agent });
  } catch (error) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(401).json({ error: "نشست نامعتبر است." });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.status(200).json({ message: "خروج با موفقیت انجام شد." });
}
