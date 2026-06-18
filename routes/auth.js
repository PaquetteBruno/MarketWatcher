import express from 'express';
import { registerUser, loginUser, googleLoginUser } from '../controllers/authController.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a brand new user profile
 *     description: Creates a fresh user account record and automatically generates an accompanying default portfolio envelope workspace.
 *     tags:
 *       - Authentication & Sessions
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
 *                 example: trader_bruno
 *               email:
 *                 type: string
 *                 example: bruno@marketwatcher.com
 *               password:
 *                 type: string
 *                 example: SuperSecurePass123
 *     responses:
 *       201:
 *         description: Account successfully registered and baseline database records provisioned.
 *       400:
 *         description: Missing required structural input fields.
 *       409:
 *         description: Conflict block. The username or email is already registered inside MySQL.
 *       500:
 *         description: Internal processing or connection pipeline error.
 */
router.post('/register', registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and open a secure session
 *     description: Verifies credentials against data tables and issues a validation signature access token.
 *     tags:
 *       - Authentication & Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: bruno@marketwatcher.com
 *               password:
 *                 type: string
 *                 example: SuperSecurePass123
 *     responses:
 *       200:
 *         description: Authentication successful. Token and target configuration parameters returned.
 *       400:
 *         description: Missing email or password parameter strings.
 *       401:
 *         description: Access denied. Invalid credential parameters provided.
 *       500:
 *         description: Internal server error.
 */
router.post('/login', loginUser);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 *     tags:
 *       - Authentication & Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google session successfully authorized.
 *       500:
 *         description: Internal processing failure.
 */
router.post('/google', googleLoginUser); // 👈 We will import this next!

export default router;
