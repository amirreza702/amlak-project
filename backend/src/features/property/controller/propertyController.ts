/**
 * ============================================================
 * Property Controller
 * ============================================================
 *
 * Controller مسئول دریافت Request و ارسال Response است.
 *
 * منطق Business در Service قرار دارد و Controller نباید
 * منطق مربوط به Property را خودش انجام دهد.
 * ============================================================
 */

import { Request, Response } from "express";

import {
  getPropertyById,
  registerProperty,
} from "../service/propertyService";

/**
 * ============================================================
 * ثبت ملک
 * ============================================================
 */
export async function registerPropertyController(
  req: Request,
  res: Response
) {
  try {
    const result = await registerProperty(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "خطای ناشناخته در ثبت ملک",
    });
  }
}

/**
 * ============================================================
 * دریافت جزئیات یک ملک
 * ============================================================
 *
 * GET /properties/:id
 *
 * نکته:
 *
 * در این Route می‌دانیم که id یک string است.
 * بنابراین نوع Params را به Request اعلام می‌کنیم.
 */
export async function getPropertyByIdController(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const property = await getPropertyById(req.params.id);

    res.status(200).json(property);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "ملک مورد نظر پیدا نشد.",
    });
  }
}