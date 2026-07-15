import db from "../config/db.js";

class User {
  static async create({ username, email, password }) {
    const userSql =
      "INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)";
    const [userResult] = await db.query(userSql, [username, email, password]);
    const userId = userResult.insertId;

    // Every user needs a portfolio to start with.
    const portfolioSql =
      "INSERT INTO portfolio (userId, name, selected) VALUES (?, 'Default', 1)";
    await db.query(portfolioSql, [userId]);

    return userId;
  }

  static async getByEmail(email) {
    const sql = `SELECT id, username, email, password_hash, avatar_url 
                     FROM user
                     WHERE email = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [email]);

    return rows.length > 0 ? rows[0] : null;
  }

  static async getByUsername(username) {
    const sql = `SELECT id, username, email, avatar_url 
                     FROM user
                     WHERE username = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [username]);

    return rows.length > 0 ? rows[0] : null;
  }

  static async getById(id) {
    const sql = `SELECT id, username, email, avatar_url, created_at 
                   FROM user
                  WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async getPortfolios(userId) {
    const sql = `SELECT * from portfolio where userId = ?`;
    const [rows] = await db.query(sql, [userId]);
    return rows || [];
  }
}

export default User;
