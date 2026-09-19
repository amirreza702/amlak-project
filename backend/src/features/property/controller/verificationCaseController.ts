/**
 * ============================================================
 * VerificationCase Controller
 * ============================================================
 *
 * Controller فقط مسئول:
 *
 * 1. دریافت Request
 * 2. استخراج Property ID
 * 3. فراخوانی Service
 * 4. ارسال Response
 *
 * منطق Business در Service قرار دارد.
 */

import type { Request, Response } from "express";

import {
  createVerificationCaseService,
} from "../service/verificationCaseService";

/**
 * ایجاد یا دریافت پرونده تأیید Property
 *
 * POST /properties/:id/verification
 */
export async function createVerificationCaseController(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const propertyId = req.params.id;

    const verificationCase =
      await createVerificationCaseService(propertyId);

    return res.status(201).json({
      verificationCase,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "خطایی در ایجاد پرونده تأیید رخ داد.",
    });
  }
}