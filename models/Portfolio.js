import db from "../config/db.js";
import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

class Portfolio {
  static async getPortfolio(portfolioId) {
    const sql = `SELECT * FROM portfolio WHERE id = ?`;
    const [rows] = await db.query(sql, [portfolioId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async getPortfolios(userId) {
    const sql = `SELECT * FROM portfolio WHERE userId = ?`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  static async getSelectedPortfolio(userId) {
    const sql = `SELECT * FROM portfolio WHERE userId = ? and selected = 1`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async createPortfolio(userId, name, isSelected) {
    const sql = `INSERT INTO portfolio (userId, name, selected) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [userId], [name], [isSelected]);
    return result.insertId;
  }

  static async updatePortfolio(portfolioId, name, isSelected) {
    // if the portfolio we save has isSelected = 1, we look for another selected portfolio with selected = 1, set it to 0
    if (isSelected) {
      let sql = `select p1.id 
               from portfolio p1
               join portfolio p2 on p1.userId = p2.userId
              where p2.id = ?
                and p2.id <> p1.id
                and p1.selected = 1;`;

      const [rows] = await db.query(sql, [portfolioId]);

      if (rows.length > 0) {
        sql = `update portfolio set selected = 0 where id = ?`;
        await db.query(sql, rows[0].id);
      }
    }

    const updateSql = `update portfolio set name = ?, selected = ? where id = ?`;
    const [result] = await db.query(updateSql, [portfolioId]);

    return result.length > 0 ? result[0] : null;
  }

  static async deletePortfolio(portfolioId) {
    const sql = `DELETE FROM portfolio where id = ?`;

    const [result] = await db.query(sql, [portfolioId]);

    return result.length > 0 ? result[0] : null;
  }

  static async getPortfolioAssets(portfolioId) {
    const sql = `
            SELECT asset.id, asset.symbol, asset.name, asset.type, asset.price, asset.price_change 
            FROM asset
            JOIN portfolio_asset ON portfolio_asset.assetId = asset.id
            WHERE portfolio_asset.portfolioId = ?
        `;

    const [rows] = await db.query(sql, [portfolioId]);

    if (rows && rows.length > 0) {
      this.updatePortfolioAssets(rows); // Will update all the prices / price changes from Yahoo.

      return await db.query(sql, [portfolioId]); // ReFetch the list with fresh data.
    }
    return rows;
  }

  static async createPortfolioAsset(portfolioId, assetId) {
    const sql = `INSERT IGNORE INTO portfolio_asset (portfolioId, assetId) VALUES (?, ?)`;
    const [result] = await db.query(sql, [portfolioId, assetId]);
    return result.insertId;
  }

  static async deletePortfolioAsset(portfolioId, symbol) {
    const sql = `DELETE pa 
                   FROM portfolio_asset pa
                   JOIN asset on asset.id = pa.assetId
                  WHERE pa.portfolioId = ? 
                    AND asset.symbol = ?`;

    const [result] = await db.query(sql, [portfolioId, symbol]);

    return result.length > 0 ? result[0] : null;
  }

  static async getActivePortfolio(userId) {
    const sql = `SELECT id, name from portfolio where userId = ? AND selected = 1`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
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
}

export default Portfolio;
