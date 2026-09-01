// ایمپورت روتر Express برای تعریف مسیرهای ماژول مشاور
import { Router } from "express";
// کنترلرهای ثبت‌نام، ورود، خروج — منطق اصلی هر مسیر
import { register, login, logout, getMeController } from "../controller/agentController";

// ساخت روتر اختصاصی مشاور
const router = Router();

// ثبت‌نام مشاور: POST /api/agents/register (با پیشوند app.ts)
router.post("/register", register);
// ورود مشاور: POST /api/agents/login
router.post("/login", login);
// اطلاعات مشاور لاگین‌شده از روی کوکی hasاک_token
router.get("/me", getMeController);
// خروج: پاک شدن کوکی
router.post("/logout", logout);

// خروجی روتر برای مونت در app.ts
export default router;
