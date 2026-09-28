/**
 * ============================================================
 * Customer Routes
 * ============================================================
 *
 * Routeهای مربوط به Feature Customer.
 *
 * ساختار:
 *
 * HTTP Request
 *      ↓
 * Route
 *      ↓
 * Controller
 *      ↓
 * Service
 *      ↓
 * Repository
 *      ↓
 * Database
 *
 * ============================================================
 */

import { Router } from "express";

import {
  addPropertyToFavoriteController,
  removePropertyFromFavoriteController,
  getCustomerFavoritesController,
} from "../controller/customerPropertyFavoriteController";

import {
  createCustomerSearchRequestController,
  getCustomerSearchRequestController,
  getCustomerSearchRequestsController,
  closeCustomerSearchRequestController,
  updateCustomerSearchRequestController,
  getActivePropertySearchRequestsController,
} from "../controller/propertySearchRequestController";

import {
  accessCustomerContactController,
} from "../controller/contactAccessController";

import {
  createAgentSubscriptionController,
  upgradeAgentSubscriptionController,
} from "../controller/agentSubscriptionController";

const router = Router();

// ============================================================
// FAVORITES
// ============================================================

router.post(
  "/customers/:customerId/favorites/:propertyId",
  addPropertyToFavoriteController
);

router.delete(
  "/customers/:customerId/favorites/:propertyId",
  removePropertyFromFavoriteController
);

router.get(
  "/customers/:customerId/favorites",
  getCustomerFavoritesController
);

// ============================================================
// PROPERTY SEARCH REQUESTS
// ============================================================

/**
 * ایجاد درخواست جستجوی جدید
 */
router.post(
  "/customers/:customerId/search-requests",
  createCustomerSearchRequestController
);

/**
 * دریافت تمام درخواست‌های جستجوی مشتری
 */
router.get(
  "/customers/:customerId/search-requests",
  getCustomerSearchRequestsController
);

/**
 * دریافت یک درخواست جستجوی مشخص
 */
router.get(
  "/customers/:customerId/search-requests/:requestId",
  getCustomerSearchRequestController
);

/**
 * بستن درخواست جستجو
 */
router.put(
  "/customers/:customerId/search-requests/:requestId/close",
  closeCustomerSearchRequestController
);

router.put(
  "/customers/:customerId/search-requests/:requestId",
  updateCustomerSearchRequestController
);

router.get(
  "/search-requests/active",
  getActivePropertySearchRequestsController
);

// ============================================================
// AGENT CONTACT ACCESS
// ============================================================

router.post(
  "/agents/:agentId/search-requests/:searchRequestId/contact",
  accessCustomerContactController
);

// ============================================================
// AGENT SUBSCRIPTIONS
// ============================================================

router.post(
  "/agents/:agentId/subscriptions",
  createAgentSubscriptionController
);

router.put(
  "/agents/:agentId/subscriptions",
  upgradeAgentSubscriptionController
);

export default router;