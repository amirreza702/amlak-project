/**
 * ============================================================
 * Owner Controller
 * ============================================================
 *
 * Controller مسئول ارتباط HTTP است.
 *
 * وظایف:
 * - دریافت پارامترهای Request
 * - فراخوانی Service
 * - تبدیل نتیجه به HTTP Response
 * - مدیریت خطاهای شناخته‌شده
 *
 * منطق Business در Service قرار دارد.
 * ============================================================
 */

import { Request, Response } from "express";
import {
  getOwnerProfile,
  updateOwnerProfileService,
} from "../service/ownerService";

/**
 * نوع پارامترهای Route مربوط به Owner
 *
 * ownerId در این Route باید یک مقدار string باشد.
 */
type OwnerRouteParams = {
  ownerId: string;
};

/**
 * ------------------------------------------------------------
 * دریافت Profile مالک
 * ------------------------------------------------------------
 *
 * GET /owners/:ownerId/profile
 */
export async function getOwnerProfileController(
  req: Request<OwnerRouteParams>,
  res: Response
) {
  try {
    const owner =
      await getOwnerProfile(
        req.params.ownerId
      );

    return res.status(200).json(owner);
  } catch (error: any) {
    if (error.message === "Owner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(
      "Error getting owner profile:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * ------------------------------------------------------------
 * ویرایش Profile مالک
 * ------------------------------------------------------------
 *
 * PUT /owners/:ownerId/profile
 */
export async function updateOwnerProfileController(
  req: Request<OwnerRouteParams>,
  res: Response
) {
  try {
    const owner =
      await updateOwnerProfileService(
        req.params.ownerId,
        req.body
      );

    return res.status(200).json(owner);
  } catch (error: any) {
    if (error.message === "Owner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
        "First name cannot be empty" ||
      error.message ===
        "Last name cannot be empty" ||
      error.message ===
        "No profile fields to update"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(
      "Error updating owner profile:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}