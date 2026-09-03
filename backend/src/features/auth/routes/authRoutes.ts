// src/features/auth/routes/authRoutes.ts
import { Router } from "express";
import { register, login, logout, getMe } from "../controller/authController";

const router = Router();

// مسیرهای استاندارد احراز هویت
router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
