import db from "../config/db.js";

class User {
  // CREATE: Register a new user and auto-provision their default portfolio container
  static async create({ username, email, password }) {
    let connection; // Declare variable outer scope so finally block can see it

    try {
      connection = await db.getConnection(); // Now safely caught if it fails
      await connection.beginTransaction();

      // 1. Insert user registry payload record
      const userSql =
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
      const [userResult] = await connection.query(userSql, [
        username,
        email,
        password,
      ]);
      const userId = userResult.insertId;

      // 2. Automate creation of their first standard tracking layout envelope
      const portfolioSql =
        "INSERT INTO portfolios (user_id, name, selected) VALUES (?, 'Default', 1)";
      await connection.query(portfolioSql, [userId]);

      await connection.commit();
      return userId;
    } catch (error) {
      // Only attempt rollback if the connection was actually established
      if (connection) {
        await connection.rollback();
      }
      throw error; // Pass error to controller so frontend gets a 500 response
    } finally {
      // Only release if the connection exists
      if (connection) {
        connection.release();
      }
    }
  }

  // READ: Look up a user profile object using their unique email parameter pointer
  static async findByEmail(email) {
    const sql = `SELECT id, username, email, password_hash, avatar_url 
                     FROM users 
                     WHERE email = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [email]);

    // FIXED: Returns the first object item in the array list if it exists, otherwise null
    return rows.length > 0 ? rows[0] : null;
  }

  // READ: Look up a user profile object using their unique username pointer string
  static async findByUsername(username) {
    const sql = `SELECT id, username, email, avatar_url 
                     FROM users 
                     WHERE username = ? 
                     LIMIT 1`;
    const [rows] = await db.query(sql, [username]);

    // FIXED: Returns the first object item in the array list if it exists, otherwise null
    return rows.length > 0 ? rows[0] : null;
  }

  // READ: Find user object via primary key
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
