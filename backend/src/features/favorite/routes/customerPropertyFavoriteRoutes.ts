/**
 * ============================================================
 * Customer Property Favorite Routes
 * ============================================================
 *
 * وظیفه:
 *
 * فقط تعریف مسیرهای HTTP مربوط به علاقه‌مندی مشتری به ملک.
 *
 * Business Logic در Service
 * HTTP Logic در Controller
 *
 * ============================================================
 */

import { Router } from "express";

import {
  addPropertyToFavoritesController,
  removePropertyFromFavoritesController,
  isPropertyFavoriteController,
  getCustomerFavoritesController,
} from "../controller/customerPropertyFavoriteController";

const router = Router();

/**
 * افزودن ملک به علاقه‌مندی
 *
 * POST /customers/:customerId/favorites/:propertyId
 */
router.post(
  "/customers/:customerId/favorites/:propertyId",
  addPropertyToFavoritesController
);

/**
 * حذف ملک از علاقه‌مندی
 *
 * DELETE /customers/:customerId/favorites/:propertyId
 */
router.delete(
  "/customers/:customerId/favorites/:propertyId",
  removePropertyFromFavoritesController
);

/**
 * بررسی علاقه‌مندی یک ملک
 *
 * GET /customers/:customerId/favorites/:propertyId
 */
router.get(
  "/customers/:customerId/favorites/:propertyId",
  isPropertyFavoriteController
);

/**
 * دریافت تمام علاقه‌مندی‌های مشتری
 *
 * GET /customers/:customerId/favorites
 */
router.get(
  "/customers/:customerId/favorites",
  getCustomerFavoritesController
);

export default router;