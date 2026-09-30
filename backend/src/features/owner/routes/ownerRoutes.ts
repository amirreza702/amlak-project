/**
 * ============================================================
 * Owner Routes
 * ============================================================
 *
 * Route فقط مسیر HTTP را به Controller متصل می‌کند.
 *
 * منطق Business در Service قرار دارد.
 * ============================================================
 */

import { Router } from "express";

import {
  getOwnerProfileController,
  updateOwnerProfileController,
} from "../controller/ownerController";

const router = Router();

/**
 * دریافت Profile مالک
 */
router.get(
  "/owners/:ownerId/profile",
  getOwnerProfileController
);

/**
 * ویرایش Profile مالک
 */
router.put(
  "/owners/:ownerId/profile",
  updateOwnerProfileController
);

export default router;