/**
 * ============================================================
 * Property Owner Verification Controller
 * ============================================================
 *
 * وظیفه Controller:
 *
 * HTTP Request
 *      ↓
 * دریافت propertyId و ownerId
 *      ↓
 * دریافت status و reason
 *      ↓
 * Verification Service
 *      ↓
 * HTTP Response
 *
 * performedBy فعلاً از Client دریافت نمی‌شود.
 * بعداً از Authentication / HashtiStaff استخراج خواهد شد.
 */

import type { Request, Response } from "express";

import { VerificationStatus } from "@prisma/client";

import {
  verifyPropertyOwner,
} from "../service/propertyOwnerVerificationService";

export async function verifyPropertyOwnerController(
  req: Request<
    { id: string; ownerId: string },
    unknown,
    {
      status: VerificationStatus;
      reason?: string;
    }
  >,
  res: Response
) {
  try {
    const propertyId = req.params.id;
    const ownerId = req.params.ownerId;

    const { status, reason } = req.body;

    const propertyOwner =
      await verifyPropertyOwner({
        propertyId,
        ownerId,
        status,
        reason,
      });

    return res.status(200).json({
      propertyOwner,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "خطایی در تأیید مالک رخ داد.",
    });
  }
}