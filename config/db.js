import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "market_watcher",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = {
  query: async (sql, params) => {
    // 1. Execute the original query first the app is never delayed
    const result = await pool.query(sql, params);

    // 2. Skip logging if table is query_log
    if (!sql.includes("query_log")) {
      try {
        const formattedParams = params ? JSON.stringify(params) : null;

        pool
          .query(
            "INSERT INTO query_log (query_text, query_params) VALUES (?, ?)",
            [sql, formattedParams],
          )
          .catch((err) =>
            console.error("Failed to save query log to DB:", err),
          );
      } catch (logError) {
        console.error("Error formatting query log:", logError);
      }
    }

    return result;
  },

  getConnection: () => pool.getConnection(),
  pool: pool,
};

export default db;
