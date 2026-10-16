import { Router } from "express";
import { login, signup, me, logout, sendSignupOtp } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.get("/me", requireAuth, me);
router.post("/send-otp", sendSignupOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
