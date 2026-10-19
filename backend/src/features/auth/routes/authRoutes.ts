
import { Router } from "express";
import { UserRole } from "@prisma/client";

import {
  registerUserController,
  loginUserController,
  logoutUserController,
  adminResetUserPasswordController,
  listAdminUsersController,
} from "../controller/authController";

import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/requireRole";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { requireAdminPermission } from "../../admin/middleware/requireAdminPermission";

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
router.post("/auth/logout", authMiddleware, logoutUserController);

// فهرست کاربران با جست‌وجو و فیلتر؛ فقط کارکنان دارای مجوز هشتی
router.use("/auth/admin/users", authMiddleware, requireAdminPermission("USERS_READ"));
router.get(
  "/auth/admin/users",
  authMiddleware,
  requireRole(UserRole.HASHTI),
  listAdminUsersController
);

// بازنشانی رمز فقط برای کارکنانی که مجوز مدیریت کارکنان دارند؛ این مسیر زیرمجموعه مسیر کاربران است.
router.use("/auth/admin/users/:userId/reset-password", authMiddleware, requireAdminPermission("STAFF_MANAGE"));
router.post(
  "/auth/admin/users/:userId/reset-password",
  authMiddleware,
  requireRole(UserRole.HASHTI),
  adminResetUserPasswordController
);

// تغییر رمز شخصی با OTP در آینده پیاده‌سازی خواهد شد.
// فعلاً هیچ endpoint فعالی برای این قابلیت تعریف نمی‌شود.

export default router;
