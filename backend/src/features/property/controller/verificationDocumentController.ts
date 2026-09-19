/**
 * ============================================================
 * VerificationDocument Controller
 * ============================================================
 *
 * مسئول دریافت Request و ارسال Response.
 *
 * منطق Business در Service قرار دارد.
 */

import type { Request, Response } from "express";

import {
  createVerificationDocumentService,
} from "../service/verificationDocumentService";

/**
 * ثبت یک مدرک در پرونده تأیید
 *
 * POST /verification-cases/:id/documents
 */
export async function createVerificationDocumentController(
  req: Request<
    { id: string },
    unknown,
    {
      documentType: string;
      fileUrl: string;
    }
  >,
  res: Response
) {
  try {
    const verificationCaseId = req.params.id;

    const {
      documentType,
      fileUrl,
    } = req.body;

    const verificationDocument =
      await createVerificationDocumentService({
        verificationCaseId,
        documentType,
        fileUrl,
      });

    return res.status(201).json({
      verificationDocument,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "خطایی در ثبت مدرک رخ داد.",
    });
  }
}