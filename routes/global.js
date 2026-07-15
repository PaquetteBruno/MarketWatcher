/**
 * @swagger
 * tags:
 *   name: Global
 *   description: Global market banner information.
 */

/**
 * @swagger
 * /api/global:
 *   get:
 *     summary: Retrieve live global market ticker data.
 *     tags:
 *       - Global
 *     responses:
 *       200:
 *         description: Global assets retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *       500:
 *         description: Internal server error.
 */

import express from "express";
import { getGlobalPrices } from "../controllers/globalController.js";

const router = express.Router();

router.get("/", getGlobalPrices);

export default router;
