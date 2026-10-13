
import { Router } from "express";

import {
  getAgentProfileController,
  updateAgentProfileController,
} from "../controller/agentController";

import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";

import { UserRole } from "@prisma/client";

const router = Router();

/**
 * دریافت پروفایل مشاور:
 * فقط کاربر واردشده با نقش AGENT.
 * کنترل مالکیت شناسه Agent نیز باید در مرحله بعد
 * داخل Service انجام شود.
 */
router.get(
  "/agents/:agentId/profile",
  authMiddleware,
  requireRole(UserRole.AGENT),
  getAgentProfileController
);

/**
 * ویرایش پروفایل مشاور:
 * فقط کاربر واردشده با نقش AGENT.
 * کنترل مالکیت در Service الزامی است.
 */
router.put(
  "/agents/:agentId/profile",
  authMiddleware,
  requireRole(UserRole.AGENT),
  updateAgentProfileController
);

export default router;
