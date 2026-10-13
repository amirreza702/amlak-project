
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

import {
  loginUserService,
  registerUserService,
  logoutUserService,
  adminResetUserPasswordService,
} from "../service/authService";

/**
 * ثبت‌نام کاربر جدید
 * POST /auth/register
 */
export async function registerUserController(
  req: Request,
  res: Response
) {
  try {
    const { mobile, password, role } = req.body;

    if (
      typeof mobile !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !mobile.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Mobile, password and role are required",
      });
    }

    const allowedRoles: UserRole[] = [
      UserRole.CUSTOMER,
      UserRole.OWNER,
      UserRole.AGENT,
    ];

    if (!allowedRoles.includes(role as UserRole)) {
      return res.status(400).json({
        message: "Invalid or unauthorized registration role",
      });
    }

    const user = await registerUserService({
      mobile: mobile.trim(),
      password,
      role: role as UserRole,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "USER_ALREADY_EXISTS") {
        return res.status(409).json({
          message: "This mobile number is already registered",
        });
      }

      
if (error.message === "INVALID_MOBILE") {
  return res.status(400).json({
    message: "Invalid Iranian mobile number",
  });
}

if (error.message === "PASSWORD_TOO_SHORT") {
  return res.status(400).json({
    message: "Password must be at least 8 characters long",
  });
}


      if (error.message === "ROLE_NOT_ALLOWED") {
        return res.status(403).json({
          message: "This role cannot be registered publicly",
        });
      }
    }

    console.error("Error registering user:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * ورود کاربر و ایجاد Session
 * POST /auth/login
 */
export async function loginUserController(
  req: Request,
  res: Response
) {
  try {
    const { mobile, password } = req.body;

    if (
      typeof mobile !== "string" ||
      typeof password !== "string" ||
      !mobile.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Mobile and password are required",
      });
    }

    const result = await loginUserService(
      mobile.trim(),
      password
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("hashti_session", result.sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      expires: result.expiresAt,
    });

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          message: "Mobile number or password is incorrect",
        });
      }

      if (error.message === "USER_INACTIVE") {
        return res.status(403).json({
          message: "This account is inactive",
        });
      }
    }

    console.error("Error logging in:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * خروج کاربر و حذف Session فعلی
 * POST /auth/logout
 */
export async function logoutUserController(
  req: Request,
  res: Response
) {
  try {
    const sessionToken = req.cookies?.hashti_session;

    if (typeof sessionToken !== "string" || !sessionToken) {
      res.clearCookie("hashti_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(200).json({
        message: "Logged out successfully",
      });
    }

    await logoutUserService(sessionToken);

    res.clearCookie("hashti_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error: unknown) {
    console.error("Error logging out:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


/**
 * بازنشانی رمز حساب کاربر توسط کارکنان هشتی
 * POST /auth/admin/users/:userId/reset-password
 */
export async function adminResetUserPasswordController(
  req: Request,
  res: Response
) {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (
      typeof userId !== "string" ||
      !userId.trim() ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "User ID and new password are required",
      });
    }

    const user = await adminResetUserPasswordService(
      userId,
      newPassword
    );

    return res.status(200).json({
      message: "User password reset successfully",
      user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (error.message === "PASSWORD_TOO_SHORT") {
        return res.status(400).json({
          message: "Password must be at least 8 characters long",
        });
      }

      if (error.message === "INVALID_USER_ID") {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }
    }

    console.error("Error resetting user password:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

