// ایمپورت تایپ‌های درخواست و پاسخ از فریم‌ورک اکسپرس
import { Request, Response } from "express";
// ایمپورت توابع سرویس برای ثبت‌نام، ورود و دریافت اطلاعات مشاور
import {
  registerAgentService,
  loginAgentService,
  getAgentById,
  getCurrentAgentService
} from "../service/agentService";
// ایمپورت کلاینت Prisma — قبلاً جا افتاده بود و باعث ReferenceError می‌شد
import { prisma } from "../../../lib/prisma";

// متد کنترلر برای ثبت‌نام مشاور جدید
export async function register(
  // آبجکت درخواست ورودی
  req: Request,
  // آبجکت پاسخ خروجی
  res: Response
) {
  try {
    // فراخوانی متد ثبت‌نام در لایه سرویس با داده‌های بدنه درخواست
    const { agent, token } = await registerAgentService(req.body);

    // تنظیم کوکی حاوی توکن JWT در پاسخ به مرورگر
    res.cookie("hashti_token", token, {
      // فقط از طریق پروتکل HTTP قابل دسترسی باشد (امنیت در برابر XSS)
      httpOnly: true,
      // در حالت پروداکشن فقط روی HTTPS ارسال شود
      secure: process.env.NODE_ENV === "production",
      // سیاست SameSite برای جلوگیری از حملات CSRF
      sameSite: "lax",
      // مدت اعتبار کوکی: ۷ روز بر حسب میلی‌ثانیه
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ارسال پاسخ موفق همراه با اطلاعات عمومی مشاور
    return res.status(201).json({
      // پیام موفقیت به فارسی
      message: "ثبت‌نام با موفقیت انجام شد.",
      // آبجکت مشاور ایجاد شده
      agent,
    });
  } catch (error: any) {
    // ارسال پاسخ خطا با استاتوس 400 در صورت بروز مشکل
    return res.status(400).json({
      // پیام خطای دریافت شده از بیزینس لاجیک یا پیام پیش‌فرض
      message: error.message || "خطا در ثبت‌نام مشاور",
    });
  }
}

// متد کنترلر برای ورود مشاور به سیستم
export async function login(
  // آبجکت درخواست ورودی
  req: Request,
  // آبجکت پاسخ خروجی
  res: Response
) {
  try {
    // دریافت شماره موبایل و رمز عبور از بدنه درخواست
    const { mobile, password } = req.body;

    // بررسی و احراز هویت مشاور در لایه سرویس
    const { agent, token } = await loginAgentService(mobile, password);

    // تنظیم کوکی احراز هویت در مرورگر
    res.cookie("hashti_token", token, {
      // غیرقابل دسترس برای کدهای جاوااسکریپت سمت کلاینت
      httpOnly: true,
      // فعال‌سازی امنیت SSL در محیط پروداکشن
      secure: process.env.NODE_ENV === "production",
      // حفاظت در برابر جعل درخواست میان‌سایتی
      sameSite: "lax",
      // انقضای کوکی بعد از ۷ روز
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ارسال پاسخ موفقیت‌آمیز ورود
    return res.status(200).json({
      // پیام خوش‌آمدگویی و ورود موفق
      message: "ورود با موفقیت انجام شد.",
      // اطلاعات کاربر لاگین شده
      agent,
    });
  } catch (error: any) {
    // ارسال خطای عدم دسترسی یا اشتباه بودن مشخصات
    return res.status(401).json({
      // متن پیام خطای لاگین
      message: error.message || "شماره موبایل یا رمز عبور اشتباه است.",
    });
  }
}

// متد کنترلر برای دریافت اطلاعات مشاور جاری (Me)
export async function me(
  // درخواست ورودی که شناسه مشاور در آن توسط میدل‌ور یا کوکی قرار می‌گیرد
  req: any,
  // آبجکت پاسخ
  res: Response
) {
  try {
    // خواندن شناسه مشاور از شیء درخواست
    const agentId = req.agentId || req.cookies?.agentId;

    // در صورت نبود شناسه، کاربر لاگین نیست
    if (!agentId) {
      // ارسال خطای 401 Unauthenticated
      return res.status(401).json({ message: "کاربر وارد نشده است." });
    }

    // دریافت اطلاعات مشاور از پایگاه داده
    const agent = await getAgentById(agentId);

    // ارسال اطلاعات عمومی مشاور
    return res.status(200).json(agent);
  } catch (error: any) {
    // ارسال پیام خطا در صورت عدم یافتن کاربر
    return res.status(404).json({ message: error.message });
  }
}

// متد کنترلر برای خروج مشاور از حساب کاربری
export async function logout(
  // درخواست اکسپرس
  _req: Request,
  // پاسخ اکسپرس
  res: Response
) {
  // پاک کردن کوکی احراز هویت با خالی کردن مقدار آن
  res.clearCookie("hashti_token");
  // ارسال پاسخ موفقیت‌آمیز خروج
  return res.status(200).json({ message: "خروج با موفقیت انجام شد." });
}

// کنترلر: خواندن کوکی hashti_token و برگرداندن پروفایل مشاور
export async function getMeController(req: Request, res: Response) {
  try {
    // استخراج توکن از کوکی‌های درخواست
    const token = req.cookies?.hashti_token;
    // فراخوانی سرویس دریافت مشاور جاری
    const agent = await getCurrentAgentService(token);
    // پاسخ موفق با پروفایل مشاور
    res.json(agent);
  } catch (error) {
    // در صورت نبود/نامعتبر بودن توکن، پاسخ 401
    res.status(401).json({ message: error instanceof Error ? error.message : "دسترسی غیرمجاز" });
  }
}

