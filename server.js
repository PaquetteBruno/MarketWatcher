const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const YahooFinance = require('yahoo-finance2').default; 
const yahooFinance = new YahooFinance(); 

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Centralized MySQL Connection Pool (Uses your clean .env credentials)
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
        // Yahoo Finance tracks Apple and Microsoft via their clean standard symbols
        const [aaplData, msftData] = await Promise.all([
            yahooFinance.quote('AAPL'),
            yahooFinance.quote('MSFT')
        ]);

        const liveStocks = [
            {
                symbol: 'AAPL',
                name: aaplData.longName || 'Apple Inc.',
                market: 'NASDAQ',
                price: aaplData.regularMarketPrice,
                change: `${aaplData.regularMarketChangePercent >= 0 ? '+' : ''}${aaplData.regularMarketChangePercent.toFixed(2)}%`
            },
            {
                symbol: 'MSFT',
                name: msftData.longName || 'Microsoft Corp.',
                market: 'NASDAQ',
                price: msftData.regularMarketPrice,
                change: `${msftData.regularMarketChangePercent >= 0 ? '+' : ''}${msftData.regularMarketChangePercent.toFixed(2)}%`
            }
        ];

        // Sync fresh values straight into your local stocks table cache
        for (const stock of liveStocks) {
            await db.query(
                `INSERT INTO stocks (symbol, name, market, price, price_change) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE price = VALUES(price), price_change = VALUES(price_change)`,
                [stock.symbol, stock.name, stock.market, stock.price, stock.change]
            );
        }

        res.json({ market: 'NASDAQ', data: liveStocks });

    } catch (error) {
        console.warn("Notice: NASDAQ pipeline fallback initiated:", error.message);
        try {
            const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM stocks WHERE market = "NASDAQ"');
            res.json({ market: 'NASDAQ (Cached)', data: rows, rawDebug: `Yahoo Error: ${error.message}` });
        } catch (dbError) {
            res.status(500).json({ error: "Database query failed completely", details: dbError.message });
        }
    }
});

// 3. Separate Endpoint: NYSE Tab Data Query
app.get('/api/markets/nyse', async (req, res) => {
    try {
        const [jpmData, bacData] = await Promise.all([
            yahooFinance.quote('JPM'),
            yahooFinance.quote('BAC')
        ]);

        const liveStocks = [
            {
                symbol: 'JPM',
                name: jpmData.longName || 'JPMorgan Chase & Co.',
                market: 'NYSE',
                price: jpmData.regularMarketPrice,
                change: `${jpmData.regularMarketChangePercent >= 0 ? '+' : ''}${jpmData.regularMarketChangePercent.toFixed(2)}%`
            },
            {
                symbol: 'BAC',
                name: bacData.longName || 'Bank of America Corp.',
                market: 'NYSE',
                price: bacData.regularMarketPrice,
                change: `${bacData.regularMarketChangePercent >= 0 ? '+' : ''}${bacData.regularMarketChangePercent.toFixed(2)}%`
            }
        ];

        for (const stock of liveStocks) {
            await db.query(
                `INSERT INTO stocks (symbol, name, market, price, price_change) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE price = VALUES(price), price_change = VALUES(price_change)`,
                [stock.symbol, stock.name, stock.market, stock.price, stock.change]
            );
        }

        res.json({ market: 'NYSE', data: liveStocks });

    } catch (error) {
        console.warn("Notice: NYSE pipeline fallback initiated:", error.message);
        try {
            const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM stocks WHERE market = "NYSE"');
            res.json({ market: 'NYSE (Cached)', data: rows, rawDebug: `Yahoo Error: ${error.message}` });
        } catch (dbError) {
            res.status(500).json({ error: "Database query failed completely", details: dbError.message });
        }
    }
});

// 4. Separate Endpoint: Crypto Tab Data Query (Consolidated here)
app.get('/api/markets/crypto', async (req, res) => {
    try {
        // Yahoo Finance tracks main cryptocurrencies as ticker pairs (BTC-USD, ETH-USD)
        const [btcData, ethData] = await Promise.all([
            yahooFinance.quote('BTC-USD'),
            yahooFinance.quote('ETH-USD')
        ]);

        const liveCrypto = [
            {
                symbol: 'BTC',
                name: btcData.shortName || 'Bitcoin USD',
                price: btcData.regularMarketPrice,
                change: `${btcData.regularMarketChangePercent >= 0 ? '+' : ''}${btcData.regularMarketChangePercent.toFixed(2)}%`
            },
            {
                symbol: 'ETH',
                name: ethData.shortName || 'Ethereum USD',
                price: ethData.regularMarketPrice,
                change: `${ethData.regularMarketChangePercent >= 0 ? '+' : ''}${ethData.regularMarketChangePercent.toFixed(2)}%`
            }
        ];

        for (const asset of liveCrypto) {
            await db.query(
                `INSERT INTO crypto (symbol, name, price, price_change) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE price = VALUES(price), price_change = VALUES(price_change)`,
                [asset.symbol, asset.name, asset.price, asset.change]
            );
        }

        res.json({ market: 'Crypto', data: liveCrypto });

    } catch (error) {
        console.warn("Notice: Crypto pipeline fallback initiated:", error.message);
        try {
            const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM crypto');
            res.json({ market: 'Crypto (Cached)', data: rows, rawDebug: `Yahoo Error: ${error.message}` });
        } catch (dbError) {
            res.status(500).json({ error: "Database query failed completely", details: dbError.message });
        }
    }
});

// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Unified Full-Stack Yahoo Finance Engine running smoothly on port ${PORT}`);
});
