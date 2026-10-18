import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";
import {
  getHashtiContactAccessLogsController,
  getManagedAgentsController,
  setAgentVerificationController,
} from "../controller/agentManagementController";

const router = Router();

// فهرست مشاوران برای مدیریت هشتی؛ پیش‌فرض فقط مشاوران تأییدنشده است.
router.get(
  "/hashti/agents",
  authMiddleware,
  requireRole(UserRole.HASHTI),
  getManagedAgentsController
);

// تأیید یا لغو تأیید مشاور؛ فقط نشست هشتی اجازه تغییر دارد.
router.patch(
  "/hashti/agents/:agentId/verification",
  authMiddleware,
  requireRole(UserRole.HASHTI),
  setAgentVerificationController
);

// گزارش دسترسی به اطلاعات تماس مشتریان؛ اطلاعات شخصی فقط در اختیار هشتی است.
router.get(
  "/hashti/contact-access-logs",
  authMiddleware,
  requireRole(UserRole.HASHTI),
  getHashtiContactAccessLogsController
);

export default router;
