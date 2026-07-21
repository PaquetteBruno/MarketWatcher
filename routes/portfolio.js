import express from "express";
import {
  getPortfolio,
  getPortfolios,
  getSelectedPortfolio,
  createPortfolio,
  getPortfolioAssets,
  updatePortfolio,
  deletePortfolio,
  createPortfolioAsset,
  deletePortfolioAsset,
} from "../controllers/portfolioController.js";

const router = express.Router();

// get a single portfolio by id
router.get("/:id", getPortfolio);

// get all portfolios from current user
router.get("/", getPortfolios);

// get the selected portfolio
router.get("/selected/:id", getSelectedPortfolio);

// create a new portfolio for the current user
router.post("/", createPortfolio);

// update a portfolio
router.post("/:id", updatePortfolio);

// delete a portfolio by id
router.delete("/", deletePortfolio);

// get all assets for a portfolio
router.get("/:portfolioId/assets", getPortfolioAssets);

// add an asset to a portfolio
router.post("/:portfolioId/assets/:symbol", createPortfolioAsset);

// remove an asset from a portfolio
router.delete("/:portfolioId/assets/:symbol", deletePortfolioAsset);

export default router;

/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Portfolio and asset management.
 */

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Retrieve all portfolios belonging to the authenticated user.
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Portfolios retrieved successfully.
 */

/**
 * @swagger
 * /api/portfolio/{portfolioId}:
 *   get:
 *     summary: Retrieve a single portfolio.
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio identifier.
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully.
 *       404:
 *         description: Portfolio not found.
 */

/**
 * @swagger
 * /api/portfolio:
 *   post:
 *     summary: Create a new portfolio.
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Retirement
 *     responses:
 *       201:
 *         description: Portfolio created successfully.
 */

/**
 * @swagger
 * /api/portfolio/{portfolioId}:
 *   patch:
 *     summary: Rename an existing portfolio.
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dividend Stocks
 *     responses:
 *       200:
 *         description: Portfolio updated successfully.
 *       404:
 *         description: Portfolio not found.
 */

/**
 * @swagger
 * /api/portfolio/{portfolioId}:
 *   delete:
 *     summary: Delete a portfolio.
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio identifier.
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully.
 *       404:
 *         description: Portfolio not found.
 */

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assets:
 *   get:
 *     summary: Retrieve all assets belonging to a portfolio.
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio identifier.
 *     responses:
 *       200:
 *         description: Assets retrieved successfully.
 */

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assets/{symbol}:
 *   post:
 *     summary: Add an asset to a portfolio.
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ticker symbol.
 *     responses:
 *       201:
 *         description: Asset added successfully.
 *       409:
 *         description: Asset already exists in the portfolio.
 */

/**
 * @swagger
 * /api/portfolio/{portfolioId}/assets/{symbol}:
 *   delete:
 *     summary: Remove an asset from a portfolio.
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ticker symbol.
 *     responses:
 *       200:
 *         description: Asset removed successfully.
 *       404:
 *         description: Asset not found.
 */
