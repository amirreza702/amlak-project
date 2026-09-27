/**
 * ============================================================
 * Property Search Request Controller
 * ============================================================
 *
 * Controller مسئول دریافت HTTP Request و ارسال Response است.
 *
 * منطق Business در Service قرار دارد.
 * ============================================================
 */

import { Request, Response } from "express";

import {
  createCustomerSearchRequest,
  getCustomerSearchRequest,
  getCustomerSearchRequests,
} from "../service/propertySearchRequestService";

/**
 * ایجاد درخواست جستجوی ملک
 */
export async function createCustomerSearchRequestController(
  req: Request<{
    customerId: string;
  }>,
  res: Response
) {
  try {
    const result =
      await createCustomerSearchRequest(
        req.params.customerId,
        req.body
      );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message:
        error.message ||
        "خطا در ایجاد درخواست جستجو",
    });
  }
}

/**
 * دریافت یک درخواست جستجو
 */
export async function getCustomerSearchRequestController(
  req: Request<{
    customerId: string;
    requestId: string;
  }>,
  res: Response
) {
  try {
    const result =
      await getCustomerSearchRequest(
        req.params.customerId,
        req.params.requestId
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      message:
        error.message ||
        "درخواست جستجو پیدا نشد",
    });
  }
}

/**
 * دریافت تمام درخواست‌های مشتری
 */
export async function getCustomerSearchRequestsController(
  req: Request<{
    customerId: string;
  }>,
  res: Response
) {
  try {
    const result =
      await getCustomerSearchRequests(
        req.params.customerId
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      message:
        error.message ||
        "درخواست‌های جستجوی مشتری پیدا نشد",
    });
  }
}