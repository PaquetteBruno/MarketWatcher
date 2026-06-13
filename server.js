const express = require('express');
const mysql = require('mysql2/promise'); // Promises allow us to use modern async/await syntax
const cors = require('cors');
const axios = require('axios');

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
        const apiKey = process.env.COINGECKO_API_KEY;

        if (!apiKey) {
            throw new Error("COINGECKO_API_KEY variable is missing or blank inside your .env file");
        }

        // 1. Fetch live market values using Axios (Axios uses standard IPv4 routing by default)
        const apiResponse = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price`,
            {
                params: {
                    ids: 'bitcoin,ethereum',
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                    x_cg_demo_api_key: apiKey // Passes key cleanly as a URL parameter
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            }
        );

        // Axios automatically parses JSON data into an object named .data
        const rawData = apiResponse.data;

        // 2. Data Normalization: Reshape the nested payload to match your database columns
        const liveCryptoAssets = [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                price: rawData.bitcoin.usd,
                change: `${rawData.bitcoin.usd_24h_change >= 0 ? '+' : ''}${rawData.bitcoin.usd_24h_change.toFixed(2)}%`
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                price: rawData.ethereum.usd,
                change: `${rawData.ethereum.usd_24h_change >= 0 ? '+' : ''}${rawData.ethereum.usd_24h_change.toFixed(2)}%`
            }
        ];

        // 3. Keep Local Records Synced: Update your SQL database tables asynchronously
        for (const asset of liveCryptoAssets) {
            await db.query(
                `INSERT INTO crypto (symbol, name, price, price_change) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE price = VALUES(price), price_change = VALUES(price_change)`,
                [asset.symbol, asset.name, asset.price, asset.change]
            );
        }

        // 4. Send the cleaned, standardized structure straight to your active React tab
        res.json({ market: 'Crypto', data: liveCryptoAssets });

    } catch (error) {
        // Axios errors have a helpful .response or .message attached to them
        console.error("Live fetch engine malfunction:", error.message);
        res.status(500).json({ error: "Failed to pull live crypto data", details: error.message });
    }
});




// Start the Backend Node.js Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is officially listening and pulling from MySQL on port ${PORT}`);
});