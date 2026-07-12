import db from "../config/db.js";

class User {
  static async create({ username, email, password }) {
    let connection;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const userSql =
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
      const [userResult] = await connection.query(userSql, [
        username,
        email,
        password,
      ]);
      const userId = userResult.insertId;

      // Every user needs a portfolio to start with.
      const portfolioSql =
        "INSERT INTO portfolios (user_id, name, selected) VALUES (?, 'Default', 1)";
      await connection.query(portfolioSql, [userId]);

      await connection.commit();
      return userId;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async findByEmail(email) {
    const sql = `SELECT id, username, email, password_hash, avatar_url 
                     FROM users 
                     WHERE email = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [email]);

    return rows.length > 0 ? rows[0] : null;
  }

  static async findByUsername(username) {
    const sql = `SELECT id, username, email, avatar_url 
                     FROM users 
                     WHERE username = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [username]);

    return rows.length > 0 ? rows[0] : null;
  }

  static async findById(id) {
    const sql = `SELECT id, username, email, avatar_url, created_at 
                     FROM users 
                     WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async getPortfolios(user_id) {
    const sql = `SELECT * from portfolios where user_id = ?`;
    const [rows] = await db.query(sql, [user_id]);
    return rows || [];
  }
}

export default User;
