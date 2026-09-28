/**
 * ============================================================
 * Contact Access Controller
 * ============================================================
 *
 * این Controller فقط مسئول دریافت درخواست HTTP
 * و ارسال آن به Service است.
 *
 * منطق Business در Service قرار دارد.
 * ============================================================
 */

import { Request, Response } from "express";

import {
  accessCustomerContact,
} from "../service/contactAccessService";

/**
 * ------------------------------------------------------------
 * دسترسی Agent به اطلاعات تماس Customer
 * ------------------------------------------------------------
 *
 * پارامترهای مسیر:
 *
 * agentId
 * searchRequestId
 *
 * مثال:
 *
 * POST
 * /agents/:agentId/search-requests/:searchRequestId/contact
 * ------------------------------------------------------------
 */
export const accessCustomerContactController = async (
  req: Request,
  res: Response
) => {
  try {
    /**
     * دریافت شناسه Agent از URL
     */
    const agentId = req.params.agentId as string;
    const searchRequestId = req.params.searchRequestId as string;

    /**
     * اعتبارسنجی اولیه ورودی‌ها
     */
    if (!agentId || !searchRequestId) {
      return res.status(400).json({
        message: "agentId and searchRequestId are required",
      });
    }

    /**
     * اجرای منطق Business
     */
    const result = await accessCustomerContact(
      agentId,
      searchRequestId
    );

    /**
     * پاسخ موفق
     */
    return res.status(200).json(result);
  } catch (error) {
    /**
     * خطاهای شناخته‌شده Business
     */
    if (
      error instanceof Error &&
      error.message === "Search request not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Customer not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    /**
     * خطای غیرمنتظره
     */
    console.error(
      "Error accessing customer contact:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};