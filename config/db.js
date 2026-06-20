import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from your root .env file
dotenv.config();

// Keep your pool creation code exactly as it is...
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'market_watcher',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create a custom db object to intercept queries
const db = {
    // Intercept standard .query() calls
    query: async (sql, params) => {
        // 1. Execute the original query first so your app is never delayed
        const result = await pool.query(sql, params);

        // 2. Skip logging if we are looking at the query_log table itself (prevents an infinite loop)
        if (!sql.includes('query_log')) {
            try {
                // Safely format parameters as a string for text columns
                const formattedParams = params ? JSON.stringify(params) : null;
                
                // Fire and forget the log insertion into your MySQL log table
                pool.query(
                    'INSERT INTO query_log (query_text, query_params) VALUES (?, ?)', 
                    [sql, formattedParams]
                ).catch(err => console.error("❌ Failed to save query log to DB:", err));
            } catch (logError) {
                console.error("❌ Error formatting query log:", logError);
            }
        }

        return result;
    },

    // Expose the raw pool if a specific feature ever needs it directly
    getConnection: () => pool.getConnection(),
    pool: pool
};

export default db;