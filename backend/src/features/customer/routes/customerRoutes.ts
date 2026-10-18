import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createCustomerSearchRequestController,
  getCustomerSearchRequestController,
  getCustomerSearchRequestsController,
  closeCustomerSearchRequestController,
  updateCustomerSearchRequestController,
  getActivePropertySearchRequestsController,
  getActivePropertySearchRequestByIdController,
} from "../controller/propertySearchRequestController";
import { getCurrentCustomerProfileController } from "../controller/currentCustomerProfileController";
import { accessCustomerContactController } from "../controller/contactAccessController";
import {
  createAgentSubscriptionController,
  upgradeAgentSubscriptionController,
} from "../controller/agentSubscriptionController";
import {
  getCustomerProfileController,
  updateCustomerProfileController,
} from "../controller/customerController";
import { authMiddleware } from "../../auth/middleware/authMiddleware";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireOwnProfile, requireOwnSearchRequest } from "../../auth/middleware/authorizationMiddleware";

const router = Router();

// باید پیش از مسیر پارامتری :customerId ثبت شود؛ فقط پروفایل مشتری نشست فعلی را می‌دهد.
router.get(
  "/customers/me/profile",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  getCurrentCustomerProfileController
);

// پروفایل مشتری: فقط خود مشتری
router.get(
  "/customers/:customerId/profile",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  getCustomerProfileController
);
router.put(
  "/customers/:customerId/profile",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  updateCustomerProfileController
);

// درخواست‌های جست‌وجو: فقط صاحب درخواست
router.post(
  "/customers/:customerId/search-requests",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  createCustomerSearchRequestController
);
router.get(
  "/customers/:customerId/search-requests",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  getCustomerSearchRequestsController
);
router.get(
  "/customers/:customerId/search-requests/:requestId",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  requireOwnSearchRequest(),
  getCustomerSearchRequestController
);
router.put(
  "/customers/:customerId/search-requests/:requestId/close",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  requireOwnSearchRequest(),
  closeCustomerSearchRequestController
);
router.put(
  "/customers/:customerId/search-requests/:requestId",
  authMiddleware,
  requireRole(UserRole.CUSTOMER),
  requireOwnProfile("customer", "customerId"),
  requireOwnSearchRequest(),
  updateCustomerSearchRequestController
);

// درخواست‌های فعال فقط برای مشاور واردشده؛ اطلاعات تماس جداگانه کنترل می‌شود.
router.get(
  "/search-requests/active",
  authMiddleware,
  requireRole(UserRole.AGENT),
  getActivePropertySearchRequestsController
);
router.get(
  "/search-requests/active/:requestId",
  authMiddleware,
  requireRole(UserRole.AGENT),
  getActivePropertySearchRequestByIdController
);

// دسترسی تماس و اشتراک فقط برای همان مشاور صاحب نشست.
router.post(
  "/agents/:agentId/search-requests/:searchRequestId/contact",
  authMiddleware,
  requireRole(UserRole.AGENT),
  requireOwnProfile("agent", "agentId"),
  accessCustomerContactController
);
router.post(
  "/agents/:agentId/subscriptions",
  authMiddleware,
  requireRole(UserRole.AGENT),
  requireOwnProfile("agent", "agentId"),
  createAgentSubscriptionController
);
router.put(
  "/agents/:agentId/subscriptions",
  authMiddleware,
  requireRole(UserRole.AGENT),
  requireOwnProfile("agent", "agentId"),
  upgradeAgentSubscriptionController
);

export default router;
