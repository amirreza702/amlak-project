/**
 * ============================================================
 * Notification Routes
 * ============================================================
 *
 * وظیفه:
 *
 * فقط تعریف مسیرهای HTTP مربوط به Notification.
 *
 * منطق Business در Service
 * منطق HTTP در Controller
 *
 * ============================================================
 */

import { Router } from "express";

import {
  getUserNotificationsController,
  markNotificationAsReadController,
} from "../controller/notificationController";

const router = Router();

/**
 * دریافت اعلان‌های یک User
 *
 * GET /notifications/user/:userId
 */
router.get(
  "/notifications/user/:userId",
  getUserNotificationsController
);

/**
 * علامت‌گذاری اعلان به‌عنوان خوانده‌شده
 *
 * PATCH /notifications/:id/read
 */
router.patch(
  "/notifications/:id/read",
  markNotificationAsReadController
);

export default router;