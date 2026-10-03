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
  createCustomerSearchRequestController,
  getCustomerSearchRequestController,
  getCustomerSearchRequestsController,
  closeCustomerSearchRequestController,
  updateCustomerSearchRequestController,
  getActivePropertySearchRequestsController,
  getActivePropertySearchRequestByIdController,
} from "../controller/propertySearchRequestController";

import {
  accessCustomerContactController,
} from "../controller/contactAccessController";

import {
  createAgentSubscriptionController,
  upgradeAgentSubscriptionController,
} from "../controller/agentSubscriptionController";

import {
  getCustomerProfileController,
  updateCustomerProfileController,
} from "../controller/customerController";

const router = Router();

// ============================================================
// CUSTOMER PROFILE
// ============================================================

router.get(
  "/customers/:customerId/profile",
  getCustomerProfileController
);

router.put(
  "/customers/:customerId/profile",
  updateCustomerProfileController
);

// ============================================================
// PROPERTY SEARCH REQUESTS
// ============================================================

router.post(
  "/customers/:customerId/search-requests",
  createCustomerSearchRequestController
);

router.get(
  "/customers/:customerId/search-requests",
  getCustomerSearchRequestsController
);

router.get(
  "/customers/:customerId/search-requests/:requestId",
  getCustomerSearchRequestController
);

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

router.get(
  "/search-requests/active/:requestId",
  getActivePropertySearchRequestByIdController
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