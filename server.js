const express = require('express');
const mysql = require('mysql2/promise'); // Promises allow us to use modern async/await syntax
const cors = require('cors');
require('dotenv').config(); // This loads our hidden .env credentials into process.env

const app = express();
app.use(cors());
app.use(express.json()); // Allows the backend to read JSON data sent from the front-end

// 1. Establish a MySQL Connection Pool using your environment variables
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. Separate Endpoint: NASDAQ Tab Data Query
app.get('/api/markets/nasdaq', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM stocks WHERE market = "NASDAQ"');
        res.json({ market: 'NASDAQ', data: rows });
    } catch (error) {
        res.status(500).json({ error: "Database query failed", details: error.message });
    }
});

// 3. Separate Endpoint: NYSE Tab Data Query
app.get('/api/markets/nyse', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM stocks WHERE market = "NYSE"');
        res.json({ market: 'NYSE', data: rows });
    } catch (error) {
        res.status(500).json({ error: "Database query failed", details: error.message });
    }
});

// 4. Separate Endpoint: Crypto Tab Data Query
app.get('/api/markets/crypto', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM crypto');
        res.json({ market: 'Crypto', data: rows });
    } catch (error) {
        res.status(500).json({ error: "Database query failed", details: error.message });
    }
});

// Start the Backend Node.js Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is officially listening and pulling from MySQL on port ${PORT}`);
});