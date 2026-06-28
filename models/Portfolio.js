import db from "../config/db.js";

class Portfolio {
  // READ: Find the core portfolio ID belonging to a specific user_id
  static async findIdByUserId(userId) {
    const sql = `SELECT id, name FROM portfolios WHERE user_id = ? AND selected = 1`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  // CREATE: Fallback provisioner to generate a default portfolio profile container
  static async createDefault(userId) {
    const sql = `INSERT INTO portfolios (user_id, name, selected) VALUES (?, 'Default', 1)`;
    const [result] = await db.query(sql, [userId]);
    return result.insertId;
  }

  // READ: Check if an asset is already linked to a portfolio inside your bridge table
  static async findLink(portfolioId, assetId) {
    const sql = `SELECT id, name FROM portfolio_asset 
                     WHERE portfolio_id = ? AND asset_id = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [portfolioId, assetId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  // CREATE: Build a fresh structural link connection row inside the portfolio_asset join table
  static async addAssetToPortfolio(portfolioId, assetId) {
    const sql = `INSERT IGNORE INTO portfolio_asset (portfolio_id, asset_id) VALUES (?, ?)`;
    const [result] = await db.query(sql, [portfolioId, assetId]);
    return result.insertId;
  }

  static async findSelectedByUserId(userId) {
    const sql = `SELECT id, name from portfolios where user_id = ? AND selected = 1`;
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async removeAssetFromPortfolio(portfolio_id, symbol) {
    const sql = `DELETE pa 
                   FROM portfolio_asset pa
                   JOIN assets on assets.id = pa.asset_id
                  WHERE pa.portfolio_id = ? 
                    AND assets.symbol = ?`;

    const [result] = await db.query(sql, [portfolio_id, symbol]);

    return result.length > 0 ? result[0] : null;
  }
}

export default Portfolio;
