import express from 'express';
import { 
        addAssetToPortfolio, 
        removeAssetFromPortfolio,
        addTransactionPosition, 
        getPortfolioAsset 
        } 
        from '../controllers/portfolioController.js';

const router = express.Router();

/**
 * @openapi
 * /api/portfolio/add-asset:
 *   post:
 *     summary: Add a new stock profile asset to a user watchlist/portfolio workspace
 *     description: Checks if the asset exists globally, links it to the user portfolio, and pushes it onto their watchlists workspace.
 *     tags:
 *       - Portfolios & Tracking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - symbol
 *               - name
 *               - exchange
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               symbol:
 *                 type: string
 *                 example: AAPL
 *               name:
 *                 type: string
 *                 example: Apple Inc.
 *               exchange:
 *                 type: string
 *                 example: NASDAQ
 *               price:
 *                 type: number
 *                 example: 184.25
 *               price_change:
 *                 type: string
 *                 example: +1.20%
 *     responses:
 *       201:
 *         description: Asset processed and tracked inside your portfolio_asset architecture.
 *       400:
 *         description: Missing required structural input text fields.
 *       500:
 *         description: Internal server error.
 */
router.post('/add-asset', addAssetToPortfolio);

/**
 * @openapi
 * /api/portfolio/remove-asset:
 *   post:
 *     summary: Remove a stock profile asset from a portfolio workspace
 *     description: Checks if the asset exists then delete it from portfolio_asset table.
 *     tags:
 *       - Portfolios & Tracking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolio_asset_id
 *               - symbol

 *             properties:
 *               portfolio_asset_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Asset processed and tracked inside your portfolio_asset architecture.
 *       400:
 *         description: Missing required structural input text fields.
 *       500:
 *         description: Internal server error.
 */
router.post('/remove-asset', removeAssetFromPortfolio);

/**
 * @openapi
 * /api/portfolio/add-position:
 *   post:
 *     summary: Record a distinct buying transaction lot position block
 *     description: Appends an explicit transaction purchase block mapping quantity and price details under an existing portfolio asset connection reference.
 *     tags:
 *       - Portfolios & Tracking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolio_asset_id
 *               - quantity
 *               - purchase_price
 *             properties:
 *               portfolio_asset_id:
 *                 type: integer
 *                 example: 14
 *               quantity:
 *                 type: number
 *                 example: 25.5
 *               purchase_price:
 *                 type: number
 *                 example: 152.30
 *     responses:
 *       201:
 *         description: Buying lot position captured successfully.
 *       400:
 *         description: Malformed parameters or invalid quantities/prices provided.
 *       500:
 *         description: Internal processing exception error.
 */
router.post('/add-position', addTransactionPosition);

/**
 * @openapi
 * /api/portfolio/{id}:
 *   get:
 *     summary: Retrieve the active watchlist symbols and prices for a specific user
 *     description: Traverses the portfolio_asset bridge tables to collect the live stock rows tracked by a user.
 *     tags:
 *       - Portfolios & Tracking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique primary key ID of the user.
 *     responses:
 *       200:
 *         description: Watchlist array fetched cleanly.
 *       500:
 *         description: Database aggregation pipeline exception.
 */
router.get('/:id', getPortfolioAsset);

export default router;
