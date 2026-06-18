import db from '../config/db.js';

class Position {
    // CREATE: Insert a brand new buying lot transaction position block
    static async create({ portfolioAssetId, quantity, purchasePrice }) {
        const sql = `INSERT INTO positions (portfolio_asset_id, quantity, purchase_price) 
                     VALUES (?, ?, ?)`;
        const [result] = await db.query(sql, [
            portfolioAssetId, 
            quantity || 0, 
            purchasePrice || 0.00
        ]);
        return result.insertId;
    }

    // READ: Get all purchase lot blocks recorded under a single portfolio asset reference
    static async findByPortfolioAssetId(portfolioAssetId) {
        const sql = `SELECT id, quantity, purchase_price, created_at 
                     FROM positions 
                     WHERE portfolio_asset_id = ?
                     ORDER BY created_at DESC`;
        const [rows] = await db.query(sql, [portfolioAssetId]);
        return rows;
    }

    // UPDATE: Modify an existing transaction block lot (e.g., if a user edits a typo)
    static async update(id, { quantity, purchasePrice }) {
        const sql = `UPDATE positions 
                     SET quantity = ?, purchase_price = ? 
                     WHERE id = ?`;
        const [result] = await db.query(sql, [quantity, purchasePrice, id]);
        return result.affectedRows > 0;
    }

    // DELETE: Liquidate/Remove a specific position lot completely from the table
    static async delete(id) {
        const sql = `DELETE FROM positions WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
}

export default Position;
