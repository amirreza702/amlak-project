// src/features/auth/controller/authController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { hashPassword, verifyPassword, signAuthToken, verifyAuthToken } from "../service/authService";
import { AuthError, LoginPayload, RegisterPayload } from "../types/auth";
import { findAgentByMobile, createAgent, findAgentById } from "../../agent/repository/agentRepository";

// تابع کمکی برای تنظیم یکنواخت کوکی امنیتی
function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("hashti_token", token, {
    httpOnly: true,                                // جلوگیری از دسترسی JS به کوکی (ضد XSS)
    secure: isProd,                                // فقط روی HTTPS در پروداکشن
    sameSite: isProd ? "none" : "lax",             // پشتیبانی از درخواست‌های فرانت‌اند
    maxAge: 7 * 24 * 60 * 60 * 1000,              // مدت اعتبار: ۷ روز
    path: "/",
  });
}

// ۱. ثبت‌نام مشاور جدید
export async function register(req: Request<{}, {}, RegisterPayload>, res: Response) {
  try {
    const { firstName, lastName, mobile, password, agencyName, address } = req.body;

    if (!mobile || !password || !firstName || !lastName) {
      throw new AuthError("تمام فیلدهای الزامی باید پر شوند.", 400);
    }

    // بررسی تکراری نبودن شماره موبایل
    const existing = await findAgentByMobile(mobile);
    if (existing) {
      throw new AuthError("مشاوری با این شماره موبایل قبلاً ثبت شده است.", 400);
    }

    // هش کردن رمز و ذخیره مشاور در دیتابیس
    const passwordHash = await hashPassword(password);
    const newAgent = await createAgent({
      firstName,
      lastName,
      mobile,
      passwordHash,
      agencyName: agencyName || null,
      address: address || null,
      isActive: true,
    });

    // ایجاد توکن و تنظیم کوکی
    const token = signAuthToken(newAgent.id);
    setAuthCookie(res, token);

    const { passwordHash: _, ...publicAgent } = newAgent;
    res.status(201).json({
      message: "ثبت‌نام با موفقیت انجام شد.",
      agent: publicAgent,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "خطای سرور در ثبت‌نام" });
  }
}

// ۲. ورود به سیستم
export async function login(req: Request<{}, {}, LoginPayload>, res: Response) {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      throw new AuthError("شماره موبایل و رمز عبور الزامی است.", 400);
    }

    const agent = await findAgentByMobile(mobile);
    if (!agent) {
      throw new AuthError("شماره موبایل یا رمز عبور اشتباه است.", 401);
    }

    const isMatch = await verifyPassword(password, agent.passwordHash);
    if (!isMatch) {
      throw new AuthError("شماره موبایل یا رمز عبور اشتباه است.", 401);
    }

    if (!agent.isActive) {
      throw new AuthError("حساب کاربری شما غیرفعال شده است.", 403);
    }

    const token = signAuthToken(agent.id);
    setAuthCookie(res, token);

    const { passwordHash: _, ...publicAgent } = agent;
    res.status(200).json({
      message: "ورود با موفقیت انجام شد.",
      agent: publicAgent,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "خطای سرور در ورود" });
  }
}

// ۳. دریافت اطلاعات کاربر جاری (بررسی نشست)
export async function getMe(req: Request, res: Response) {
  try {
    const token = req.cookies?.hashti_token;
    if (!token) {
      throw new AuthError("کاربر وارد نشده است.", 401);
    }

    const payload = verifyAuthToken(token);
    const agent = await findAgentById(payload.sub);

    if (!agent || !agent.isActive) {
      throw new AuthError("مشاور یافت نشد یا حساب غیرفعال است.", 401);
    }

    const { passwordHash: _, ...publicAgent } = agent;
    res.status(200).json(publicAgent);
  } catch (error: any) {
    const status = error.statusCode || 401;
    res.status(status).json({ message: error.message });
  }
}

// ۴. خروج از حساب کاربری
export async function logout(req: Request, res: Response) {
  res.clearCookie("hashti_token", { path: "/" });
  res.status(200).json({ message: "خروج با موفقیت انجام شد." });
}
