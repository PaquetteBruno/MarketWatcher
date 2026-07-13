import db from "../config/db.js";

class Asset {
  static async create({ symbol, name, type, price, price_change }) {
    const upperType = type ? type.toUpperCase() : "";
    const cleanedType = upperType.includes("CRYPTOCURRENCY")
      ? "CRYPTO"
      : upperType;

    const sql = `INSERT INTO asset (symbol, name, type, price, price_change) 
                     VALUES (?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      symbol.toUpperCase(),
      name,
      cleanedType,
      price || 0.0,
      price_change || "+0.00%",
    ]);

    return result.insertId;
  }

  static async getIdBySymbol(symbol) {
    const sql = `SELECT id FROM asset WHERE symbol = ? LIMIT 1`;

    const [rows] = await db.query(sql, [symbol.toUpperCase()]);

    return rows.length > 0 ? rows[0].id : null;
  }

  static async getById(id) {
    const sql = `SELECT id, symbol, name, type, price, price_change, updated_at 
                     FROM asset 
                     WHERE id = ?`;

    const [rows] = await db.query(sql, [id]);

    return rows.length > 0 ? rows[0] : null;
  }

  static async updatePrice(id, price, priceChange) {
    const sql = `UPDATE asset
                     SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`;

    const [result] = await db.query(sql, [price, priceChange, id]);

    return result.affectedRows;
  }

  static async delete(id) {
    const sql = `DELETE FROM asset WHERE id = ?`;

    const [result] = await db.query(sql, [id]);

    return result.affectedRows;
  }
}

export default Asset;
