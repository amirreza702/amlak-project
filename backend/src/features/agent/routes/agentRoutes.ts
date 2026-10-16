import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  getAgentProfileController,
  updateAgentProfileController,
} from "../controller/agentController";
import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireOwnProfile } from "../../auth/middleware/authorizationMiddleware";

const router = Router();

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
