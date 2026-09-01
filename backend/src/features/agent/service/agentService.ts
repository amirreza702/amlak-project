// ایمپورت کتابخانه هش کردن کلمات عبور
import bcrypt from "bcrypt";
// ایمپورت کتابخانه ساخت و اعتبارسنجی توکن‌های JWT
import jwt from "jsonwebtoken";
// ایمپورت کلاینت دیتابیس برای کوئری مستقیم در صورت نیاز
import { prisma } from "../../../lib/prisma";
// ایمپورت توابع ریپازیتوری مشاور
import {
  createAgent,
  findAgentById,
  findAgentByMobile,
} from "../repository/agentRepository";
// ایمپورت تایپ‌های مشاور
import type { Agent, AgentPublic } from "../types/agent";

// کلید مخفی امضای توکن‌ها از محیط یا مقدار پیش‌فرض
const JWT_SECRET = process.env.JWT_SECRET || "hashti-default-secret-key-12345";

// کلاس اختصاصی برای مدیریت خطاهای احراز هویت همراه با کد وضعیت HTTP
export class AuthError extends Error {
  // کد وضعیت HTTP مربوط به خطا (مثلاً 401 یا 403)
  public statusCode: number;

  // سازنده کلاس خطا
  constructor(message: string, statusCode: number = 401) {
    // ارسال پیام خطا به کلاس پایه Error
    super(message);
    // ذخیره کد وضعیت در نمونه خطا
    this.statusCode = statusCode;
    // تنظیم نام اختصاصی کلاس خطا
    this.name = "AuthError";
  }
}

// تابع حذف فیلد پسورد هش‌شده برای بازگرداندن آبجکت عمومی و امن
export const sanitizeAgent = (agent: Agent): AgentPublic => {
  // تفکیک هش رمز عبور از باقی مشخصات مشاور
  const { passwordHash: _, ...publicData } = agent;
  // بازگرداندن آبجکت بدون اطلاعات حساس
  return publicData;
};

// سرویس دریافت مشخصات مشاور با شناسه یکتا
export const getAgentById = async (id: string): Promise<AgentPublic> => {
  // جستجوی مشاور در ریپازیتوری
  const agent = await findAgentById(id);
  // اگر مشاور یافت نشد، پرتاب خطای ۴۰۴
  if (!agent) {
    throw new AuthError("مشاور با این مشخصات یافت نشد.", 404);
  }
  // بازگرداندن داده‌های امن‌شده مشاور
  return sanitizeAgent(agent);
};

// سرویس ثبت‌نام مشاور جدید در سامانه
export const registerAgentService = async (
  // اطلاعات ورودی ثبت‌نام
  data: {
    firstName: string;
    lastName: string;
    mobile: string;
    password: string;
    agencyName?: string;
    address?: string;
  }
): Promise<{ agent: AgentPublic; token: string }> => {
  // بررسی یکتایی شماره موبایل در سیستم
  const existingAgent = await findAgentByMobile(data.mobile);
  // در صورت تکراری بودن، جلوگیری از ثبت‌نام
  if (existingAgent) {
    throw new AuthError("مشاوری با این شماره موبایل قبلاً در سیستم ثبت شده است.", 400);
  }

  // هش کردن رمز عبور کاربر با هزینه محاسباتی ۱۰ راند
  const passwordHash = await bcrypt.hash(data.password, 10);

  // ثبت مشاور جدید در پایگاه داده
  const newAgent = await createAgent({
    firstName: data.firstName,
    lastName: data.lastName,
    mobile: data.mobile,
    agencyName: data.agencyName || null,
    address: data.address || null,
    isActive: true,
    passwordHash,
  });

  // ساخت توکن JWT با شناسه مشاور تازه ایجاد شده (اصلاح نام متغیر از agent به newAgent)
  const token = jwt.sign(
    { agentId: newAgent.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // بازگرداندن پروفایل مشاور و توکن ایجاد شده
  return {
    agent: sanitizeAgent(newAgent),
    token,
  };
};

// سرویس ورود مشاور به سیستم
export const loginAgentService = async (
  mobile: string,
  password: string
): Promise<{ agent: AgentPublic; token: string }> => {
  // یافتن مشاور بر اساس شماره موبایل
  const agent = await findAgentByMobile(mobile);
  // اگر مشاور پیدا نشد، پیام عمومی برای امنیت بیشتر
  if (!agent) {
    throw new AuthError("شماره موبایل یا رمز عبور اشتباه است.", 401);
  }

  // بررسی صحت پسورد وارد شده با هش موجود در دیتابیس
  const isPasswordValid = await bcrypt.compare(password, agent.passwordHash);
  // در صورت عدم تطابق کلمه عبور
  if (!isPasswordValid) {
    throw new AuthError("شماره موبایل یا رمز عبور اشتباه است.", 401);
  }

  // بررسی فعال بودن وضعیت حساب کاربری
  if (!agent.isActive) {
    throw new AuthError("حساب کاربری شما غیرفعال شده است.", 403);
  }

  // امضای توکن با پی‌لود یکسان و استاندارد { agentId }
  const token = jwt.sign(
    { agentId: agent.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // بازگرداندن مشخصات کاربر و توکن
  return {
    agent: sanitizeAgent(agent),
    token,
  };
};

// سرویس اعتبارسنجی توکن کوکی و استخراج اطلاعات کاربر فعلی
export async function getCurrentAgentService(
  token: string | undefined
): Promise<AgentPublic> {
  // اگر توکن ارسال نشده باشد
  if (!token) {
    throw new AuthError("ابتدا وارد حساب شوید.", 401);
  }

  try {
    // تایید اعتبار و دیکود کردن پی‌لود توکن
    const payload = jwt.verify(token, JWT_SECRET) as { agentId: string };

    // بررسی وجود شناسه در پی‌لود
    if (!payload.agentId) {
      throw new AuthError("توکن نامعتبر است.", 401);
    }

    // واکشی اطلاعات مشاور از پایگاه داده با شناسه توکن
    const agent = await prisma.agent.findUnique({
      where: { id: payload.agentId },
    });

    // در صورتی که رکورد مشاور حذف شده یا غیرفعال باشد
    if (!agent || !agent.isActive) {
      throw new AuthError("حساب کاربری معتبر یا فعال نیست.", 401);
    }

    // بازگرداندن آبجکت تصفیه‌شده مشاور
    return sanitizeAgent(agent);
  } catch (error) {
    // اگر از قبل خطای AuthError بوده همان را پرتاب کن
    if (error instanceof AuthError) {
      throw error;
    }
    // در صورت انقضا، خرابی امضا یا دستکاری توکن
    throw new AuthError("توکن نامعتبر است. دوباره وارد شوید.", 401);
  }
}
