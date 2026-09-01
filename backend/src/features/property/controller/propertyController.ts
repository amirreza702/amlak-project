import { Request, Response } from "express";
import { registerProperty } from "../service/propertyService";

export async function registerPropertyController(req: Request, res: Response) {
  try {
    const result = await registerProperty(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "خطای ناشناخته در ثبت ملک" });
  }
}
