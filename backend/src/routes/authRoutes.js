
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {  githubLoginStart,
  githubLoginCallback,
  githubLoginExchange, googleLogin, login } from "../controllers/authController.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/login", loginLimiter, login);
router.post("/google", loginLimiter, googleLogin);
router.get("/github", githubLoginStart);
router.get("/github/callback", githubLoginCallback);
router.post("/github/exchange", loginLimiter, githubLoginExchange);

export default router;
