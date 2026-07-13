import db from "../config/db.js";
import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

class Portfolio {
  // READ: Find the core portfolio ID belonging to a specific user_id
  static async findIdByUserId(userId) {
    const sql = `SELECT id, name FROM portfolio WHERE user_id = ? AND selected = 1`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  // CREATE: Fallback provisioner to generate a default portfolio profile container
  static async createDefault(userId) {
    const sql = `INSERT INTO portfolio (user_id, name, selected) VALUES (?, 'Default', 1)`;
    const [result] = await db.query(sql, [userId]);
    return result.insertId;
  }

  static async findLink(portfolioId, assetId) {
    const sql = `SELECT id, name FROM portfolio_asset 
                     WHERE portfolio_id = ? AND asset_id = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [portfolioId, assetId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  static async getActivePortfolio(userId) {
    const sql = `SELECT id, name from portfolio where user_id = ? AND selected = 1`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async getPortfolioAssets(portfolioId) {
    const sql = `
            SELECT asset.id, asset.symbol, asset.name, asset.type, asset.price, asset.price_change 
            FROM asset
            JOIN portfolio_asset ON portfolio_asset.asset_id = asset.id
            WHERE portfolio_asset.portfolio_id = ?
        `;

    const [rows] = await db.query(sql, [portfolioId]);

    if (rows && rows.length > 0) {
      this.updatePortfolioAssets(rows); // Will update all the prices / price changes from Yahoo.

      return await db.query(sql, [portfolioId]); // ReFetch the list with fresh data.
    }
    return rows;
  }

  static async updatePortfolioAssets(assets) {
    if (assets.length > 0) {
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
          "UPDATE asset SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP WHERE symbol = ?",
          [price, price_change, symbol],
        );
      }
      console.log(
        `[${new Date().toLocaleTimeString()}] Global marquee indices synchronized.`,
      );
    }
  }

  static async addAssetToPortfolio(portfolioId, assetId) {
    const sql = `INSERT IGNORE INTO portfolio_asset (portfolio_id, asset_id) VALUES (?, ?)`;
    const [result] = await db.query(sql, [portfolioId, assetId]);
    return result.insertId;
  }

  static async removeAssetFromPortfolio(portfolio_id, symbol) {
    const sql = `DELETE pa 
                   FROM portfolio_asset pa
                   JOIN asset on asset.id = pa.asset_id
                  WHERE pa.portfolio_id = ? 
                    AND asset.symbol = ?`;

    const [result] = await db.query(sql, [portfolio_id, symbol]);

    return result.length > 0 ? result[0] : null;
  }

  static async updateSelectedPortfolio(portfolio_id) {
    let sql = `select p1.id 
                   from portfolio p1
                   join portfolio p2 on p1.user_id = p2.user_id
                  where p2.id = ?
                    and p1.selected = 1;`;
    const [rows] = await db.query(sql, [portfolio_id]);

    if (rows.length > 0) {
      sql = `update portfolio set selected = 0 where id = ?`;
      await db.query(sql, rows[0].id);
    }

    sql = `update portfolio set selected = 1 where id = ?`;
    const [result] = await db.query(sql, [portfolio_id]);

    return result.length > 0 ? result[0] : null;
  }
}

export default Portfolio;
