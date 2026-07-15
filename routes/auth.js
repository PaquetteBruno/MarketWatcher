import express from "express";
import {
  registerUser,
  loginUser,
  googleLoginUser,
} from "../controllers/authController.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management.
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new local account.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account successfully created.
 *       400:
 *         description: Invalid request.
 *       409:
 *         description: Email already exists.
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user using email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate using Google OAuth.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google login successful.
 *       401:
 *         description: Authentication failed.
 */
router.post("/google", googleLoginUser);

export default router;
