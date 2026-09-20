/**
 * ============================================================
 * Property Routes
 * ============================================================
 *
 * Routeهای مربوط به Feature Property.
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
 *
 * ============================================================
 */

import { Router } from "express";

import {
  getPropertyByIdController,
  registerPropertyController,
} from "../controller/propertyController";

import {
  searchPropertyController,
} from "../controller/propertySearchController";

import {
  createPropertyListingController,
} from "../controller/propertyListingController";

import {
  updatePropertyPriceController,
} from "../controller/propertyPriceController";

import {
  updatePropertyListingStatusController,
} from "../controller/propertyListingStatusController";

import {
  checkPropertyConfirmationController,
} from "../controller/propertyConfirmationController";

import {
  expirePropertyListingController,
} from "../controller/expirePropertyListingController";

import {
  addPropertyOwnerController,
} from "../controller/propertyOwnerController";

import {
  verifyPropertyOwnerController,
} from "../controller/propertyOwnerVerificationController";

import {
  approvePropertyAgentByOwnerController,
} from "../controller/propertyAgentApprovalController";

import {
  revokePropertyAgentController,
} from "../controller/propertyAgentRevocationController";

import {
  createVerificationCaseController,
   reviewVerificationCaseController,
} from "../controller/verificationCaseController";

import {
  createVerificationDocumentController,
   getVerificationDocumentsController,
} from "../controller/verificationDocumentController";

import {
  createPropertyMediaController,
  getPropertyMediaController,
} from "../controller/propertyMediaController";

import {
  createDuplicateReviewController,
  getDuplicateReviewsController,
  reviewDuplicateController,
} from "../controller/duplicateReviewController";

import {
  archivePropertyController,
  getPropertyArchiveController,
} from "../controller/propertyArchiveController";

import {
  createExactLocationAccessLogController,
  getExactLocationAccessLogsController,
} from "../controller/exactLocationAccessLogController";

import {
  updatePropertyController,
} from "../controller/propertyUpdateController";

const router = Router();

/**
 * ============================================================
 * Property Search
 * ============================================================
 *
 * GET /properties/search
 */
router.get(
  "/properties/search",
  searchPropertyController
);

/**
 * ============================================================
 * Property Detail
 * ============================================================
 *
 * GET /properties/:id
 */
router.get(
  "/properties/:id",
  getPropertyByIdController
);

/**
 * ============================================================
 * Property Registration
 * ============================================================
 *
 * POST /properties
 *
 * این Route همان ثبت ملک قبلی است.
 */
router.post(
  "/properties",
  registerPropertyController
);
 /** ============================================================
 * Property verification
 * ============================================================
*/
router.post(
  "/verification-cases/:id/documents",
  createVerificationDocumentController
);


router.get(
  "/verification-cases/:id/documents",
  getVerificationDocumentsController
);

router.post(
  "/properties/:id/verification",
  createVerificationCaseController
);

router.patch(
  "/verification-cases/:id/review",
  reviewVerificationCaseController
);




/**
 * ============================================================
 * Property Listing + Initial Price
 * ============================================================
 *
 * POST /properties/:id/listing
 *
 * برای ایجاد اولین Listing و ثبت اولین قیمت ملک.
 *
 * قیمت اولیه همزمان در PriceHistory با نوع INITIAL
 * ثبت می‌شود.
 */
router.post(
  "/properties/:id/listing",
  createPropertyListingController
);

/**
 * ============================================================
 * Property Price Update
 * ============================================================
 *
 * PUT /properties/:id/price
 *
 * تغییر قیمت فعلی ملک و ثبت تغییر در PriceHistory.
 */
router.put(
  "/properties/:id/price",
  updatePropertyPriceController
);

router.put(
  "/properties/:id/status",
  updatePropertyListingStatusController
);

router.get(
  "/properties/:id/confirmation",
  checkPropertyConfirmationController
);

router.put(
  "/properties/:id/expire",
  expirePropertyListingController
);

/**
 * ============================================================
 * Property Owner
 * ============================================================
 *
 * اتصال یک مالک به یک Property
 *
 * POST /properties/:id/owners
 */
router.post(
  "/properties/:id/owners",
  addPropertyOwnerController
);

router.patch(
  "/properties/:id/owners/:ownerId/verification",
  verifyPropertyOwnerController
);

/** 
* ============================================================
 * Property Agent
 * ============================================================
*/

router.patch(
  "/properties/:id/agents/:agentId/approval",
  approvePropertyAgentByOwnerController
);

router.patch(
  "/properties/:id/agents/:agentId/revoke",
  revokePropertyAgentController
);

router.post(
  "/properties/:id/media",
  createPropertyMediaController
);

router.get(
  "/properties/:id/media",
  getPropertyMediaController
);


router.post(
  "/properties/:id/duplicate-reviews",
  createDuplicateReviewController
);

router.get(
  "/properties/:id/duplicate-reviews",
  getDuplicateReviewsController
);

router.patch(
  "/duplicate-reviews/:id/review",
  reviewDuplicateController
);


/**
 * ============================================================
 * Property Archive
 * ============================================================
 */

// آرشیو کردن ملک
router.patch(
  "/properties/:id/archive",
  archivePropertyController
);

// دریافت اطلاعات آرشیو ملک
router.get(
  "/properties/:id/archive",
  getPropertyArchiveController
);

/**
 * ============================================================
 * Exact Location Access Log
 * ============================================================
 */

// ثبت سابقه دسترسی به موقعیت دقیق
router.post(
  "/properties/:id/exact-location-access-logs",
  createExactLocationAccessLogController
);

// دریافت سوابق دسترسی به موقعیت دقیق
router.get(
  "/properties/:id/exact-location-access-logs",
  getExactLocationAccessLogsController
);


router.patch(
  "/properties/:id",
  updatePropertyController
);

export default router;