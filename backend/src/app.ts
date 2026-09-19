/**
 * ============================================================
 * Application Entry Point
 * ============================================================
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import propertyRoutes from "./features/property/routes/propertyRoutes";
import authRoutes from "./features/auth/routes/authRoutes";

import {
  startPropertyExpirationScheduler,
} from "./jobs/propertyExpirationScheduler";

const app = express();

/**
 * ============================================================
 * Middleware
 * ============================================================
 */

/**
 * تنظیمات CORS برای ارتباط با کلاینت Next.js
 */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/**
 * ============================================================
 * Routes
 * ============================================================
 */

app.use(propertyRoutes);

app.use("/api/auth", authRoutes);

/**
 * ============================================================
 * Property Expiration Scheduler
 * ============================================================
 *
 * Scheduler هنگام بالا آمدن Backend فعال می‌شود.
 *
 * Scheduler خودش منطق انقضای ملک را ندارد؛
 * فقط Job مربوطه را در بازه زمانی مشخص اجرا می‌کند.
 */
startPropertyExpirationScheduler();

/**
 * ============================================================
 * Server
 * ============================================================
 */

const PORT = process.env.PORT || 4000;

app.listen(
  Number(PORT),
  "0.0.0.0",
  () => {
    console.log(
      `Server is running on http://0.0.0.0:${PORT}`
    );
  }
);

export default app;