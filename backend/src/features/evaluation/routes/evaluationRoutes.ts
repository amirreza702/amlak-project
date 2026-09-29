import { Router } from "express";

import {
  createEvaluationController,
} from "../controller/evaluationController";

const router = Router();

/**
 * ============================================================
 * ایجاد Evaluation
 * ============================================================
 *
 * POST /evaluations
 *
 * تمام انواع Evaluation از همین Endpoint
 * استفاده می‌کنند.
 */
router.post(
  "/evaluations",
  createEvaluationController
);

export default router;