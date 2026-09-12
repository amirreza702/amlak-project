// ============================================================
// Auth Controller
// ============================================================
// Controller فقط HTTP را مدیریت می‌کند.
//
// Controller:
//   Request
//      ↓
//   Service / Repository
//      ↓
//   Response
//
// منطق Prisma مستقیماً داخل Controller قرار ندارد.
// ============================================================

import {
  Request,
  Response,
} from "express";

import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  verifyAuthToken,
} from "../service/authService";

import {
  AuthError,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

import {
  createAgent,
  findAgentByMobile,
  findAgentByUserId,
  toPublicAgent,
  isMobileTaken,
} from "../../agent/repository/agentRepository";

/**
 * ============================================================
 * تنظیم Cookie احراز هویت
 * ============================================================
 */
function setAuthCookie(
  res: Response,
  token: string
) {

  const isProduction =
    process.env.NODE_ENV === "production";

  res.cookie(
    "hashti_token",
    token,
    {
      httpOnly: true,

      secure: isProduction,

      sameSite:
        isProduction
          ? "none"
          : "lax",

      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,

      path: "/",
    }
  );
}

/**
 * ============================================================
 * ثبت‌نام مشاور
 * ============================================================
 *
 * خروجی:
 *
 * User
 *   +
 * Agent
 *
 * ============================================================
 */
export async function register(
  req: Request<
    {},
    {},
    RegisterPayload
  >,
  res: Response
) {

  try {

    const {
      firstName,
      lastName,
      mobile,
      password,
      agencyName,
      address,
    } = req.body;

    /**
     * اعتبارسنجی اولیه
     */
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !mobile?.trim() ||
      !password
    ) {

      throw new AuthError(
        "نام، نام خانوادگی، شماره موبایل و رمز عبور الزامی هستند.",
        400
      );
    }

    /**
     * بررسی تکراری نبودن Mobile
     *
     * چون Mobile روی User unique است،
     * این بررسی باید روی User انجام شود.
     */
    if (
      await isMobileTaken(
        mobile.trim()
      )
    ) {

      throw new AuthError(
        "این شماره موبایل قبلاً ثبت شده است.",
        409
      );
    }

    /**
     * Hash کردن Password
     */
    const passwordHash =
      await hashPassword(password);

    /**
     * ساخت همزمان User و Agent
     */
    const result =
      await createAgent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),

        mobile: mobile.trim(),
        passwordHash,

        agencyName:
          agencyName?.trim() || null,

        address:
          address?.trim() || null,
      });

    /**
     * Token بر اساس User ID ساخته می‌شود.
     */
    const token =
      signAuthToken(
        result.user.id,
        result.user.role
      );

    setAuthCookie(
      res,
      token
    );

    /**
     * اطلاعات عمومی
     */
    res.status(201).json({
      message:
        "ثبت‌نام مشاور با موفقیت انجام شد.",

      agent: {
        id: result.agent.id,

        userId: result.user.id,

        firstName:
          result.agent.firstName,

        lastName:
          result.agent.lastName,

        agencyName:
          result.agent.agencyName,

        address:
          result.agent.address,

        isVerified:
          result.agent.isVerified,

        mobile:
          result.user.mobile,

        role:
          result.user.role,

        isActive:
          result.user.isActive,
      },
    });

  } catch (error: any) {

    /**
     * خطای Unique Prisma
     *
     * برای جلوگیری از نمایش خطای داخلی Prisma
     * به Client.
     */
    if (
      error?.code === "P2002"
    ) {

      return res.status(409).json({
        message:
          "این شماره موبایل قبلاً ثبت شده است.",
      });
    }

    const status =
      error?.statusCode || 500;

    return res.status(status).json({
      message:
        error?.message ||
        "خطای سرور در ثبت‌نام.",
    });
  }
}

/**
 * ============================================================
 * Login
 * ============================================================
 */
export async function login(
  req: Request<
    {},
    {},
    LoginPayload
  >,
  res: Response
) {

  try {

    const {
      mobile,
      password,
    } = req.body;

    if (
      !mobile?.trim() ||
      !password
    ) {

      throw new AuthError(
        "شماره موبایل و رمز عبور الزامی هستند.",
        400
      );
    }

    /**
     * پیدا کردن Agent از طریق User.mobile
     */
    const agent =
      await findAgentByMobile(
        mobile.trim()
      );

    if (!agent) {

      throw new AuthError(
        "شماره موبایل یا رمز عبور اشتباه است.",
        401
      );
    }

    /**
     * User ممکن است Password نداشته باشد.
     */
    if (!agent.passwordHash) {

      throw new AuthError(
        "برای این حساب رمز عبور تعریف نشده است.",
        401
      );
    }

    /**
     * بررسی Password
     */
    const isPasswordValid =
      await verifyPassword(
        password,
        agent.passwordHash
      );

    if (!isPasswordValid) {

      throw new AuthError(
        "شماره موبایل یا رمز عبور اشتباه است.",
        401
      );
    }

    /**
     * بررسی فعال بودن User
     */
    if (!agent.isActive) {

      throw new AuthError(
        "حساب کاربری شما غیرفعال شده است.",
        403
      );
    }

    /**
     * ساخت Token با User ID
     */
    const token =
      signAuthToken(
        agent.userId,
        agent.role
      );

    setAuthCookie(
      res,
      token
    );

    res.status(200).json({
      message:
        "ورود با موفقیت انجام شد.",

      agent: toPublicAgent(agent),
    });

  } catch (error: any) {

    const status =
      error?.statusCode || 500;

    return res.status(status).json({
      message:
        error?.message ||
        "خطای سرور در ورود.",
    });
  }
}

/**
 * ============================================================
 * دریافت اطلاعات کاربر فعلی
 * ============================================================
 */
export async function getMe(
  req: Request,
  res: Response
) {

  try {

    const token =
      req.cookies?.hashti_token;

    if (!token) {

      throw new AuthError(
        "کاربر وارد سیستم نشده است.",
        401
      );
    }

    /**
     * Token → User ID
     */
    const payload =
      verifyAuthToken(token);

    /**
     * پیدا کردن Agent از طریق User ID
     */
    const agent =
      await findAgentByUserId(
        payload.sub
      );

    if (!agent) {

      throw new AuthError(
        "حساب مشاور یافت نشد.",
        401
      );
    }

    /**
     * User فعال باشد.
     */
    if (!agent.isActive) {

      throw new AuthError(
        "حساب کاربری شما غیرفعال شده است.",
        403
      );
    }

    res.status(200).json({
      agent: toPublicAgent(agent),
    });

  } catch (error: any) {

    const status =
      error?.statusCode || 401;

    return res.status(status).json({
      message:
        error?.message ||
        "نشست کاربر معتبر نیست.",
    });
  }
}

/**
 * ============================================================
 * Logout
 * ============================================================
 */
export async function logout(
  _req: Request,
  res: Response
) {

  res.clearCookie(
    "hashti_token",
    {
      path: "/",
    }
  );

  return res.status(200).json({
    message:
      "خروج با موفقیت انجام شد.",
  });
}