import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  getOwnerProfileController,
  getCurrentOwnerProfileController,
  getCurrentOwnerPropertiesController,
  updateCurrentOwnerProfileController,
  getOwnerPropertiesController,
  updateOwnerProfileController,
} from "../controller/ownerController";
import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireOwnProfile } from "../../auth/middleware/authorizationMiddleware";

const router = Router();

// مسیرهای /me قبل از مسیرهای پارامتری تعریف می‌شوند و شناسه را از نشست می‌گیرند.
router.get(
  "/owners/me/profile",
  authMiddleware,
  requireRole(UserRole.OWNER),
  getCurrentOwnerProfileController
);

router.put(
  "/owners/me/profile",
  authMiddleware,
  requireRole(UserRole.OWNER),
  updateCurrentOwnerProfileController
);

router.get(
  "/owners/me/properties",
  authMiddleware,
  requireRole(UserRole.OWNER),
  getCurrentOwnerPropertiesController
);

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


router.get(
  "/owners/:ownerId/properties",
  authMiddleware,
  requireRole(UserRole.OWNER),
  requireOwnProfile("owner", "ownerId"),
  getOwnerPropertiesController
);

export default router;
