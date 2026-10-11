
import { Request, Response, NextFunction } from "express";

import {
  getAuthenticatedUserService,
} from "../service/authService";

// اطلاعات کاربر احراز هویت‌شده در درخواست
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    mobile: string;
    role: string;
  };
}

/**
 * بررسی اعتبار Session کاربر
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = req.cookies?.hashti_session;

    if (
      typeof sessionToken !== "string" ||
      !sessionToken
    ) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await getAuthenticatedUserService(
      sessionToken
    );

    req.user = user;

    return next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message === "SESSION_INVALID" ||
        error.message === "SESSION_EXPIRED"
      ) {
        return res.status(401).json({
          message: "Session is invalid or expired",
        });
      }

      if (error.message === "USER_INACTIVE") {
        return res.status(403).json({
          message: "This account is inactive",
        });
      }
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
