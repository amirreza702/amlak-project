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

export default router;