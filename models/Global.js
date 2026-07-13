import db from "../config/db.js";
import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

class Global {
  static async getGlobalPrices() {
    const sql =
      "SELECT id, symbol, name, price, price_change FROM global_asset WHERE show_on_banner = 1";

    const [rows] = await db.query(sql);

    if (rows && rows.length > 0) {
      this.updateGlobalPrices(rows); // Will update all the prices / price changes from Yahoo Finance.

      return await db.query(sql); // ReFetch the list with updated prices.
    }

    return null;
  }

  static async updateGlobalPrices(rows) {
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
        "UPDATE global_asset SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP WHERE symbol = ?",
        [price, price_change, symbol],
      );
    }
  }
}
export default Global;
