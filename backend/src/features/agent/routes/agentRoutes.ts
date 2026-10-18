import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  getAgentProfileController,
  getCurrentAgentProfileController,
  updateAgentProfileController,
} from "../controller/agentController";
import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireOwnProfile } from "../../auth/middleware/authorizationMiddleware";

const router = Router();

// شناسه پروفایل از User نشست استخراج می‌شود؛ به شناسه ذخیره‌شده در مرورگر وابسته نیست.
router.get(
  "/agents/me/profile",
  authMiddleware,
  requireRole(UserRole.AGENT),
  getCurrentAgentProfileController
);


router.get(
  "/agents/:agentId/profile",
  authMiddleware,
  requireRole(UserRole.AGENT),
  requireOwnProfile("agent", "agentId"),
  getAgentProfileController
);

router.put(
  "/agents/:agentId/profile",
  authMiddleware,
  requireRole(UserRole.AGENT),
  requireOwnProfile("agent", "agentId"),
  updateAgentProfileController
);

export default router;
