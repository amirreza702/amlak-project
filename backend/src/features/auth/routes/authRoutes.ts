
import { Router } from "express";

import {
  registerUserController,
  loginUserController,
  logoutUserController,
} from "../controller/authController";

import { authMiddleware } from "../middleware/authMiddleware";
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
router.post("/auth/logout", authMiddleware, logoutUserController);

export default router;
