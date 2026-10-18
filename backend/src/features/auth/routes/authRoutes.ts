
import { Router } from "express";
import { UserRole } from "@prisma/client";

import {
  registerUserController,
  loginUserController,
  logoutUserController,
  adminResetUserPasswordController,
} from "../controller/authController";

import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// ثبت‌نام کاربر جدید
router.post("/auth/register", registerUserController);

// ورود کاربر و ایجاد Session
router.post("/auth/login", loginUserController);

// دریافت اطلاعات کاربر واردشده
router.get("/auth/me", authMiddleware, (req, res) => {
  const authenticatedRequest = req as AuthenticatedRequest;

  res.status(200).json({
    user: authenticatedRequest.user,
  });
});

// خروج کاربر و حذف نشست فعلی
router.post("/auth/logout", logoutUserController);

// بازنشانی مدیریتی رمز حساب کاربر؛ فقط کارکنان هشتی
router.post(
  "/auth/admin/users/:userId/reset-password",
  authMiddleware,
  requireRole(UserRole.HASHTI),
  adminResetUserPasswordController
);

// تغییر رمز شخصی با OTP در آینده پیاده‌سازی خواهد شد.
// فعلاً هیچ endpoint فعالی برای این قابلیت تعریف نمی‌شود.

export default router;
