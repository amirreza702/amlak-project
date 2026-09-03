// src/features/auth/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../service/authService";
import { AuthError } from "../types/auth";

// گسترش دادن تایپ Request اکسپرس برای نگهداری شناسه کاربر لاگین شده
export interface AuthenticatedRequest extends Request {
  agentId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // خواندن توکن از کوکی
    const token = req.cookies?.hashti_token;

    if (!token) {
      throw new AuthError("لطفاً ابتدا وارد حساب کاربری خود شوید.", 401);
    }

    // بررسی صحت توکن و استخراج شناسه
    const payload = verifyAuthToken(token);
    req.agentId = payload.sub;

    next();
  } catch (error: any) {
    const status = error.statusCode || 401;
    res.status(status).json({ message: error.message || "خطا در احراز هویت" });
  }
}
