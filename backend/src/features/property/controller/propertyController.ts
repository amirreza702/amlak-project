import type {
  Request,
  Response,
} from "express";

import { registerProperty } from "../service/propertyService";


export function registerPropertyController(
  req: Request,
  res: Response
) {

  try {

    // اطلاعات ارسال‌شده توسط Client
    const data = req.body;


    // اجرای Use Case ثبت ملک
    const result =
      registerProperty(data);


    // پاسخ موفق
    res.status(201).json(result);

  } catch (error) {

    // تبدیل خطای Business به HTTP Response
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "خطای ناشناخته",
    });
  }
}