import { Router } from "express";

import {
  registerPropertyController,
} from "../controller/propertyController";

import {
  searchPropertyController,
} from "../controller/propertySearchController";

const router = Router();

/**
 * ============================================================
 * Property Search
 * ============================================================
 *
 * GET /properties/search
 */
router.get(
  "/properties/search",
  searchPropertyController
);

/**
 * ============================================================
 * Property Registration
 * ============================================================
 *
 * این Route فعلاً همان ثبت ملک قبلی است
 * و در این مرحله تغییر نمی‌کند.
 */
router.post(
  "/properties",
  registerPropertyController
);

export default router;