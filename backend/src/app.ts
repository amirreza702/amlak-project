// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import propertyRoutes from "./features/property/routes/propertyRoutes";
import agentRoutes from "./features/agent/routes/agentRoutes";
import authRoutes from "./features/auth/routes/authRoutes"; // ۱. ایمپورت روت جدید

const app = express();

// تنظیمات CORS برای ارتباط ایمن با کلاینت Next.js
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // ارسال و دریافت کوکی بین دو پورت
  })
);

app.use(express.json());
app.use(cookieParser());

// ثبت روت‌های پروژه‌
app.use(propertyRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/auth", authRoutes); // ۲. ثبت روت‌های احراز هویت در مسیر /api/auth

const PORT = process.env.PORT || 4000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

export default app;
