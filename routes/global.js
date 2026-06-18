import express from 'express';
import db from '../config/db.js';

// 🔌 PULL THE LOGICAL NATIVE CLASS SYMBOL FROM THE LIBRARY
import YahooFinanceClass from 'yahoo-finance2';

// INITIALIZE THE OBJECT PROPERLY USING THE 'new' KEYWORD AS THE ENGINE EXPECTS!
const yahooFinance = new YahooFinanceClass({ 
    suppressNotices: ['yahooSurvey'] 
}); 

const router = express.Router();

// =========================================================================
// ⏳ BACKGROUND CRON-STYLE SYNC DAEMON
// =========================================================================
async function updateGlobalPrices() {
    try {
        const [rows] = await db.query("SELECT symbol FROM globals WHERE show_on_banner = 1");
        if (rows.length === 0) return;

        const symbols = rows.map(r => r.symbol);
        const quotes = await yahooFinance.quote(symbols);

        const quoteMap = {};
        if (Array.isArray(quotes)) {
            quotes.forEach(q => { if (q?.symbol) quoteMap[q.symbol.toLowerCase()] = q; });
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
                [price, price_change, symbol]
            );
        }
        console.log(`[${new Date().toLocaleTimeString()}] Global marquee indices synchronized.`);
    } catch (error) {
        console.error("Markets Background Worker Sync Interrupted:", error.message);
    }
}

// Automatically sync indicators every 5 minutes (300,000 ms)
setInterval(updateGlobalPrices, 300000);
// Manual boot sync execution when the server starts up
updateGlobalPrices();

// =========================================================================
// 🏷️ SWAGGER ROUTE SPECIFICATIONS
// =========================================================================
/**
 * @openapi
 * /api/markets/global:
 *   get:
 *     summary: Retrieve real-time metrics for global macro indices
 *     description: Fetches all indices selected to display on the running marquee banner ticker.
 *     tags:
 *       - Global Markets Ticker
 *     responses:
 *       200:
 *         description: Success layout payload returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 market:
 *                   type: string
 *                   example: global
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       symbol:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: string
 *                       price_change:
 *                         type: string
 *       500:
 *         description: Internal database pipeline connection bottleneck.
 */
router.get('/', async (req, res) => {
    try {
        const [globals] = await db.query(
            "SELECT id, symbol, name, price, price_change FROM globals WHERE show_on_banner = 1"
        );
        res.json({ market: "global", data: globals });
    } catch (error) {
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
});

export default router;
