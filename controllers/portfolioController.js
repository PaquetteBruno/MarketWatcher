import Asset from '../models/Asset.js';
import Portfolio from '../models/Portfolio.js';
import Position from '../models/Position.js';
import db from '../config/db.js';

// =========================================================================
// 📈 ADD ASSET TO PORTFOLIO / WATCHLIST WORKSPACE
// =========================================================================
export const addAssetToPortfolio = async (req, res) => {
    try {
        const { user_id, symbol, name, exchange, price, price_change } = req.body;

        // 1. Fail Fast Input Validation Guard
        if (!user_id || !symbol || !name || !exchange) {
            return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
        }

        const assetSymbolUpper = symbol.toUpperCase();

        // 2. Ensure the asset profile exists in our centralized assets directory
        let assetId = await Asset.findIdBySymbol(assetSymbolUpper);
        if (!assetId) {
            assetId = await Asset.create({
                globalId: 1, // Baseline system link fallback identifier
                symbol: assetSymbolUpper,
                name,
                exchange,
                price: price || 0.00,
                priceChange: price_change || '+0.00%'
            });
        }

        // 3. Retrieve the user's active portfolio ID directly
        let portfolioId = await Portfolio.findIdByUserId(user_id);
        if (!portfolioId) {
            portfolioId = await Portfolio.createDefault(user_id);
        }

        // 4. Bind the asset to the portfolio inside the streamlined portfolio_asset bridge
        let portfolioAssetId = await Portfolio.findLink(portfolioId, assetId);
        if (!portfolioAssetId) {
            portfolioAssetId = await Portfolio.createLink(portfolioId, assetId);
        }

        // 5. Explicitly register it onto the user's active watchlist index
        await Portfolio.addToWatchlist(portfolioAssetId);

        res.status(201).json({
            message: "ASSET_SUCCESSFULLY_ADDED",
            data: { portfolioAssetId, portfolioId, assetId }
        });
    } catch (error) {
        console.error("Controller Asset Addition Loop Error:", error.message);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
    }
};

export const removeAssetFromPortfolio = async (req, res) => {
    try {
        const { portfolioAssetId} = req.body;

        await Portfolio.removeAssetFromPortfolio(portfolioAssetId);
        
        res.status(201).json({
            message: "ASSET_SUCCESSFULLY_REMOVED",
            data: { portfolioAssetId }
        });
    } catch (error) {
        console.error("Controller Remove Asset Error:", error.message);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
    }
};
// =========================================================================
// 🪙 RECORD A DISTINCT POSITION TRANSACTION LOT
// =========================================================================
export const addTransactionPosition = async (req, res) => {
    try {
        const { portfolio_asset_id, quantity, purchase_price } = req.body;

        // 1. Validate incoming quantitative types cleanly
        const qty = parseFloat(quantity);
        const price = parseFloat(purchase_price);

        if (!portfolio_asset_id || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
            return res.status(400).json({ error: "INVALID_QUANTITY_OR_PRICE" });
        }

        // 2. Execute multi-lot tracking insert via Model layer
        const positionId = await Position.create({
            portfolioAssetId: portfolio_asset_id,
            quantity: qty,
            purchasePrice: price
        });

        res.status(201).json({
            message: "POSITION_RECORDED_SUCCESSFULLY",
            data: { positionId }
        });
    } catch (error) {
        console.error("Controller Position Processing Error:", error.message);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
    }
};

// =========================================================================
// 📋 RETRIEVE RECENT ACTIVE USER WATCHLIST SNAPSHOTS
// =========================================================================
export const getPortfolioAsset = async (req, res) => {
    try {
        const portfolioId = req.params.id;

        const sql = `
            SELECT assets.id, assets.symbol, assets.name, assets.asset_type, assets.price, assets.price_change 
            FROM assets 
            JOIN portfolio_asset ON portfolio_asset.asset_id = assets.id
            WHERE portfolio_asset.portfolio_id = ?
        `;
        
        const [assets] = await db.query(sql, [portfolioId]);

        // Returns an empty array gracefully to your React state hook if they have no stocks yet
        res.status(200).json({ data: assets });
    } catch (error) {
        console.error("Controller Watchlist Retreival Exception:", error.message);
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
};
