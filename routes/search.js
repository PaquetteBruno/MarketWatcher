import express from "express";

import { searchAssets } from "../controllers/searchController.js";

const router = express.Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 */
router.get("/", searchAssets);

export default router;
