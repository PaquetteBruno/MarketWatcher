import express from "express";
import db from "../config/db.js";
import YahooFinanceClass from "yahoo-finance2";

// INITIALIZE THE OBJECT PROPERLY USING THE 'new' KEYWORD AS THE ENGINE EXPECTS!
const yahooFinance = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

const router = express.Router();

// =========================================================================
// ⏳ BACKGROUND CRON-STYLE SYNC DAEMON
// =========================================================================
async function updateGlobalPrices() {
  try {
    const [rows] = await db.query(
      "SELECT symbol FROM globals WHERE show_on_banner = 1",
    );
    if (rows.length === 0) return;

    const symbols = rows.map((r) => r.symbol);
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
        "UPDATE globals SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP WHERE symbol = ?",
        [price, price_change, symbol],
      );
    }
    console.log(
      `[${new Date().toLocaleTimeString()}] Global marquee indices synchronized.`,
    );
  } catch (error) {
    console.error("Markets Background Worker Sync Interrupted:", error.message);
  }
}

setInterval(updateGlobalPrices, 600000);

updateGlobalPrices();

/**
 * @openapi
 * /api/global/get:
 *   post:
 *     summary: Register a brand new user profile
 *     description: Creates a fresh user account record and automatically generates an accompanying default portfolio envelope workspace.
 */
router.get("/", async (req, res) => {
  try {
    const [globals] = await db.query(
      "SELECT id, symbol, name, price, price_change FROM globals WHERE show_on_banner = 1",
    );
    res.json({ market: "global", data: globals });
  } catch (error) {
    res
      .status(500)
      .json({ error: "DB_CONNECTION_ERROR", details: error.message });
  }
});

export default router;
