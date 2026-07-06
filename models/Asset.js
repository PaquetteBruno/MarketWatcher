import db from "../config/db.js";

class Asset {
  static async create({ symbol, name, type, price, price_change }) {
    const sql = `INSERT INTO assets (symbol, name, type, price, price_change) 
                     VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      symbol.toUpperCase(),
      name,
      type,
      price || 0.0,
      price_change || "+0.00%",
    ]);

    return result.insertId;
  }

  static async findIdBySymbol(symbol) {
    const sql = `SELECT id FROM assets WHERE symbol = ? LIMIT 1`;
    const [rows] = await db.query(sql, [symbol.toUpperCase()]);
    return rows.length > 0 ? rows[0].id : null;
  }

  static async findById(id) {
    const sql = `SELECT id, symbol, name, type, price, price_change, updated_at 
                     FROM assets 
                     WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async updatePrice(id, price, priceChange) {
    const sql = `UPDATE assets 
                     SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`;
    const [result] = await db.query(sql, [price, priceChange, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const sql = `DELETE FROM assets WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
}

export default Asset;
