import Asset from "../models/Asset.js";
import Portfolio from "../models/Portfolio.js";
import Position from "../models/Position.js";
import db from "../config/db.js";
import YahooFinanceClass from "yahoo-finance2";

// =========================================================================
// 📈 ADD ASSET TO PORTFOLIO / WATCHLIST WORKSPACE
// =========================================================================
export const addAssetToPortfolio = async (req, res) => {
  try {
    const { portfolio_id, symbol, name, type, price, price_change } = req.body;

    // 1. Fail Fast Input Validation Guard
    if (!portfolio_id || !symbol) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    let asset_id = await Asset.findIdBySymbol(symbol);

    if (!asset_id) {
      asset_id = await Asset.create({
        symbol,
        name,
        type,
        price,
        price_change,
      });
    }

    await Portfolio.addAssetToPortfolio(portfolio_id, asset_id);

    res.status(201).json({
      message: "ASSET_SUCCESSFULLY_ADDED",
    });
  } catch (error) {
    console.error("Controller addAssetToPortfolio Error:", error.message);
    res
      .status(500)
      .json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
  }
};

export const removeAssetFromPortfolio = async (req, res) => {
  try {
    const { portfolio_id, symbol } = req.body;

    await Portfolio.removeAssetFromPortfolio(portfolio_id, symbol);

    res.status(201).json({
      message: "ASSET_SUCCESSFULLY_REMOVED",
      data: { portfolio_id, symbol },
    });
  } catch (error) {
    console.error("Controller Remove Asset Error:", error.message);
    res
      .status(500)
      .json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
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

    if (
      !portfolio_asset_id ||
      isNaN(qty) ||
      qty <= 0 ||
      isNaN(price) ||
      price < 0
    ) {
      return res.status(400).json({ error: "INVALID_QUANTITY_OR_PRICE" });
    }

    // 2. Execute multi-lot tracking insert via Model layer
    const positionId = await Position.create({
      portfolioAssetId: portfolio_asset_id,
      quantity: qty,
      purchasePrice: price,
    });

    res.status(201).json({
      message: "POSITION_RECORDED_SUCCESSFULLY",
      data: { positionId },
    });
  } catch (error) {
    console.error("Controller Position Processing Error:", error.message);
    res
      .status(500)
      .json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
  }
};

// =========================================================================
// 📋 RETRIEVE RECENT ACTIVE USER WATCHLIST SNAPSHOTS
// =========================================================================
export const getPortfolioAsset = async (req, res) => {
  try {
    const yahooFinance = new YahooFinanceClass({
      suppressNotices: ["yahooSurvey"],
    });

    const portfolioId = req.params.id;

    const sql = `
            SELECT assets.id, assets.symbol, assets.name, assets.type, assets.price, assets.price_change 
            FROM assets 
            JOIN portfolio_asset ON portfolio_asset.asset_id = assets.id
            WHERE portfolio_asset.portfolio_id = ?
        `;

    const [assets] = await db.query(sql, [portfolioId]);

    const symbols = assets.map((r) => r.symbol);
    const quotes = await yahooFinance.quote(symbols);

    const quoteMap = {};
    if (Array.isArray(quotes)) {
      quotes.forEach((q) => {
        if (q?.symbol) quoteMap[q.symbol.toLowerCase()] = q;
      });
    } else if (quotes?.symbol) {
      quoteMap[quotes.symbol.toLowerCase()] = quotes;
    }

    for (const symbol of symbols) {
      const liveData = quoteMap[symbol.toLowerCase()];
      if (!liveData) continue;

      const price = liveData.regularMarketPrice || 0;
      const changePercent = liveData.regularMarketChangePercent || 0;
      const price_change = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

      await db.query(
        "UPDATE assets SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP WHERE symbol = ?",
        [price, price_change, symbol],
      );
    }
    console.log(
      `[${new Date().toLocaleTimeString()}] Global marquee indices synchronized.`,
    );

    // Returns an empty array gracefully to your React state hook if they have no stocks yet
    res.status(200).json({ data: assets });
  } catch (error) {
    console.error("Controller Watchlist Retreival Exception:", error.message);
    res
      .status(500)
      .json({ error: "DB_CONNECTION_ERROR", details: error.message });
  }
};
