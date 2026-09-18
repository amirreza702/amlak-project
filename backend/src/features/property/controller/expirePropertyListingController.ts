import { Request, Response } from "express";

import {
  expirePropertyListing,
} from "../service/expirePropertyListingService";

/**
 * بررسی انقضای اعتبار ملک
 *
 * اگر confirmUntil گذشته باشد و Listing
 * در وضعیت PUBLISHED باشد، آن را EXPIRED می‌کند.
 */
export async function expirePropertyListingController(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const result =
      await expirePropertyListing(
        req.params.id
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      message:
        error.message ||
        "خطا در بررسی انقضای ملک",
    });
  }
}