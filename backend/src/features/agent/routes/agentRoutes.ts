
/**
 * ============================================================
 * Agent Routes
 * ============================================================
 *
 * Route فقط مسیر HTTP را به Controller متصل می‌کند.
 *
 * منطق Business در Service قرار دارد.
 * ============================================================
 */

import { Router } from "express";

import {
  getAgentProfileController,
  updateAgentProfileController,
} from "../controller/agentController";

const router = Router();

/**
 * دریافت Profile مشاور
 */
router.get(
  "/agents/:agentId/profile",
  getAgentProfileController
);

/**
 * ویرایش Profile مشاور
 */
router.put(
  "/agents/:agentId/profile",
  updateAgentProfileController
);

export default router;
