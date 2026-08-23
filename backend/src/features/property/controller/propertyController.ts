import type {
  Request,
  Response,
} from "express";


import {
  registerProperty,
} from "../service/propertyService";


/**
 * HTTP Controller
 *
 * مسئول دریافت HTTP Request و
 * تبدیل نتیجه Use Case به HTTP Response است.
 */
export function registerPropertyController(
  req: Request,
  res: Response
) {

  try {

    // داده ارسال‌شده توسط Client
    const data =
      req.body;


    // اجرای Use Case
    const result =
      registerProperty(data);


    // پاسخ موفق
    res
      .status(201)
      .json(result);

  } catch (error) {

    // خطای Business
    res
      .status(400)
      .json({

        message:
          error instanceof Error
            ? error.message
            : "خطای ناشناخته",
      });
  }
}