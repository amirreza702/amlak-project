import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  getOwnerProfileController,
  updateOwnerProfileController,
} from "../controller/ownerController";
import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireOwnProfile } from "../../auth/middleware/authorizationMiddleware";

const router = Router();

// فقط مالک واردشده می‌تواند پروفایل متعلق به خودش را بخواند یا تغییر دهد.
router.get(
  "/owners/:ownerId/profile",
  authMiddleware,
  requireRole(UserRole.OWNER),
  requireOwnProfile("owner", "ownerId"),
  getOwnerProfileController
);

router.put(
  "/owners/:ownerId/profile",
  authMiddleware,
  requireRole(UserRole.OWNER),
  requireOwnProfile("owner", "ownerId"),
  updateOwnerProfileController
);

export default router;
