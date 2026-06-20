import express from "express";
import {
  registerUser,
  loginUser,
  googleLoginUser,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a brand new user profile
 *     description: Creates a fresh user account record and automatically generates an accompanying default portfolio envelope workspace.
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and open a secure session
 *     description: Verifies credentials against data tables and issues a validation signature access token.
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 */
router.post("/google", googleLoginUser); // 👈 We will import this next!

export default router;
