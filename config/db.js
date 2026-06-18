import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from your root .env file
dotenv.config();

// Create a connection pool configuration profile
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'market_watcher',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool connection instance so models can import it directly
export default db;
