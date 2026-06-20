import express from "express";
import {
  addAssetToPortfolio,
  removeAssetFromPortfolio,
  addTransactionPosition,
  getPortfolioAsset,
} from "../controllers/portfolioController.js";

const router = express.Router();

/**
 * @openapi
 * /api/portfolio/add-asset:
 *   post:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 */
router.post("/add-asset", addAssetToPortfolio);

/**
 * @openapi
 * /api/portfolio/remove-asset:
 *   delete:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 */
router.delete("/remove-asset", removeAssetFromPortfolio);

/**
 * @openapi
 * /api/portfolio/add-position:
 *   post:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 */
router.post("/add-position", addTransactionPosition);

/**
 * @openapi
 * /api/portfolio/:id:
 *   get:
 *     summary: Authenticate or register a user via Google OAuth
 *     description: Intercepts a Google credential payload token and creates a session.
 */
router.get("/:id", getPortfolioAsset);

export default router;
