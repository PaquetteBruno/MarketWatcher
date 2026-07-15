import db from "../config/db.js";

class Position {
  static async create({ portfolioAssetId, quantity, purchasePrice }) {
    const sql = `INSERT INTO position (portfolioAssetId, quantity, purchase_price) 
                     VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [
      portfolioAssetId,
      quantity || 0,
      purchasePrice || 0.0,
    ]);
    return result.insertId;
  }

  static async getByPortfolioAssetId(portfolioAssetId) {
    const sql = `SELECT id, quantity, purchase_price, created_at 
                     FROM position
                     WHERE portfolioAssetId = ?
                     ORDER BY created_at DESC`;
    const [rows] = await db.query(sql, [portfolioAssetId]);
    return rows.length > 0 ? rows : null;
  }

  static async update(id, { quantity, purchasePrice }) {
    const sql = `UPDATE position
                     SET quantity = ?, purchase_price = ? 
                     WHERE id = ?`;
    const [result] = await db.query(sql, [quantity, purchasePrice, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = `DELETE FROM positions WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
}

export default Position;
