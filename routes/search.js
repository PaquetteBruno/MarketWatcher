import express from "express";

import { searchAssets } from "../controllers/searchController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search financial assets using Yahoo Finance.
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for stocks, ETFs, cryptocurrencies and other financial assets.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset symbol or company name.
 *     responses:
 *       200:
 *         description: Search completed successfully.
 *       400:
 *         description: Missing search query.
 */
router.get("/", searchAssets);

export default router;
