import { Request, Response } from "express";
import { findAgentById, findAgentByMobile } from "../repository/agentRepository";
import { signToken, verifyPassword, verifyToken } from "../service/authService";

/**
 * نام کوکی و تنظیمات طول عمر (۷ روز)
 */
const AUTH_COOKIE_NAME = "hashti_token";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * تایپ کمکی برای فیلتر کردن اطلاعات حساس
 */
type AgentWithPassword = {
  id: string;
  mobile: string;
  passwordHash: string;
  [key: string]: any;
};

function sanitizeAgent(agent: AgentWithPassword) {
  const { passwordHash: _passwordHash, ...publicAgent } = agent;
  return publicAgent;
}

/**
 * POST /api/agents/login
 * عملیات ورود مشاور و ست کردن کوکی
 */
export async function login(req: Request, res: Response) {
  try {
    const body = req.body ?? {};
    const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!mobile || !password) {
      return res.status(400).json({
        error: "شماره موبایل و رمز عبور الزامی است.",
      });
    }

    const agent = (await findAgentByMobile(mobile)) as AgentWithPassword | null;

    if (!agent) {
      return res.status(401).json({
        error: "شماره موبایل یا رمز عبور اشتباه است.",
      });
    }

    const isMatch = await verifyPassword(password, agent.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        error: "شماره موبایل یا رمز عبور اشتباه است.",
      });
    }

    // ساخت توکن بر اساس آیدی ایجنت
    const token = signToken({ sub: agent.id });

    // ارسال توکن در کوکی امن
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    return res.status(200).json({
      message: "ورود با موفقیت انجام شد.",
      agent: sanitizeAgent(agent),
    });
  } catch (error) {
    console.error("❌ Error in login controller:", error);
    return res.status(500).json({
      error: "خطای داخلی سرور در فرآیند ورود.",
    });
  }
}

/**
 * GET /api/agents/me
 * بررسی احراز هویت و برگرداندن مشخصات کاربر جاری
 */
export async function me(req: Request, res: Response) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        error: "احراز هویت انجام نشده است.",
      });
    }

    let payload: { sub?: string };

    try {
      payload = verifyToken(token);
    } catch {
      res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      return res.status(401).json({
        error: "نشست شما منقضی یا نامعتبر است.",
      });
    }

    const agentId = payload?.sub;

    if (!agentId || typeof agentId !== "string") {
      return res.status(401).json({
        error: "توکن احراز هویت نامعتبر است.",
      });
    }

    const agent = (await findAgentById(agentId)) as AgentWithPassword | null;

    if (!agent) {
      res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      return res.status(401).json({
        error: "کاربر یافت نشد.",
      });
    }

    return res.status(200).json({
      agent: sanitizeAgent(agent),
    });
  } catch (error) {
    console.error("❌ Error in me controller:", error);
    return res.status(500).json({
      error: "خطای داخلی سرور در دریافت اطلاعات کاربر.",
    });
  }
}

/**
 * POST /api/agents/logout
 * خروج و حذف کوکی احراز هویت
 */
export async function logout(_req: Request, res: Response) {
  try {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({
      message: "با موفقیت خارج شدید.",
    });
  } catch (error) {
    console.error("❌ Error in logout controller:", error);
    return res.status(500).json({
      error: "خطای داخلی سرور در فرآیند خروج.",
    });
  }
}
