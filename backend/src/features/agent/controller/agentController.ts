/**
 * ============================================================
 * Agent Controller
 * ============================================================
 *
 * این Controller فقط مسئول ارتباط HTTP است.
 *
 * منطق Business در Agent Service قرار دارد.
 *
 * ============================================================
 */

import { Request, Response } from "express";

import {
  getAgentProfile,
  updateAgentProfile,
} from "../service/agentService";

/**
 * ============================================================
 * نوع پارامترهای Route
 * ============================================================
 *
 * Express ممکن است پارامتر Route را به صورت
 * string | string[] در نظر بگیرد.
 *
 * در این Feature، agentId همیشه باید یک string باشد.
 */
type AgentRouteParams = {
  agentId: string;
};

/**
 * ============================================================
 * دریافت Profile مشاور
 * ============================================================
 */
export async function getAgentProfileController(
  req: Request<AgentRouteParams>,
  res: Response
) {
  try {
    const { agentId } = req.params;

    const result = await getAgentProfile(agentId);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "مشاور مورد نظر پیدا نشد.") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(
      "Error getting agent profile:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * ============================================================
 * ویرایش Profile مشاور
 * ============================================================
 */
export async function updateAgentProfileController(
  req: Request<AgentRouteParams>,
  res: Response
) {
  try {
    const { agentId } = req.params;

    const result = await updateAgentProfile(
      agentId,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "مشاور مورد نظر پیدا نشد.") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
        "نام مشاور نمی‌تواند خالی باشد." ||
      error.message ===
        "نام خانوادگی مشاور نمی‌تواند خالی باشد." ||
      error.message ===
        "حداقل یک فیلد برای ویرایش ارسال کنید."
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(
      "Error updating agent profile:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}