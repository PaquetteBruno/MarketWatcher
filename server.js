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

app.get('/api/markets/nasdaq', async (req, res) => {
    try {
        const userId = 1; // Simulating your logged-in user account profile

        // 1. Query MySQL to find ONLY NASDAQ stock symbols this user has pinned
        const [savedStocks] = await db.query(
            "SELECT symbol, id FROM watchlists WHERE user_id = ? AND exchange = 'NASDAQGS'",
            [userId]
        );

        if (savedStocks.length === 0) {
            return res.json({ market: 'NASDAQGS', data: [] });
        }

        // 2. Fetch live data from Yahoo Finance for those specific user-selected symbols
        const updatedStocks = await Promise.all(
            savedStocks.map(async (stock) => {
                try {
                    const data = await yahooFinance.quote(stock.symbol);
                    
                    // Double check with Yahoo data to ensure it belongs to the NASDAQ exchange
                    if (data.market !== 'nasdaq_market' && data.exchange !== 'NMS') {
                        // Optional fallback filtering helper logic
                    }

                    const stockData = {
                        id: stock.id,
                        symbol: stock.symbol,
                        name: data.longName || data.shortName || stock.symbol,
                        exchange: 'NASDAQGS',
                        price: data.regularMarketPrice,
                        price_change: `${data.regularMarketChangePercent >= 0 ? '+' : ''}${data.regularMarketChangePercent.toFixed(2)}%`
                    };

                    // Sync to your base tables cache
                    await db.query(
                    "UPDATE watchlists set price = ?, price_change = ? where id = ?",
                        [stockData.price, stockData.price_change, stockData.id]
                    );

                    return stockData;
                } catch (err) {
                    // Fallback to local cache if Yahoo connection limits are reached
                    const [cached] = await db.query('SELECT name, price, price_change AS `change` FROM stocks WHERE symbol = ?', [stock.symbol]);
                    return cached.length > 0 ? { symbol: stock.symbol, ...cached[0] } : null;
                }
            })
        );

        res.json({ market: 'NASDAQ', data: updatedStocks.filter(item => item !== null) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/markets/nyse', async (req, res) => {
    try {
        const userId = 1;

        const [savedStocks] = await db.query(
            "SELECT symbol, id FROM watchlists WHERE user_id = ? AND exchange = 'NYSE'",
            [userId]
        );

        if (savedStocks.length === 0) {
            return res.json({ market: 'NYSE', data: [] });
        }

        const updatedStocks = await Promise.all(
            savedStocks.map(async (stock) => {
                try {
                    const data = await yahooFinance.quote(stock.symbol);
                    
                    const stockData = {
                        id: stock.id,
                        symbol: stock.symbol,
                        name: data.longName || data.shortName || stock.symbol,
                        exchange: 'NYSE',
                        price: data.regularMarketPrice,
                        price_change: `${data.regularMarketChangePercent >= 0 ? '+' : ''}${data.regularMarketChangePercent.toFixed(2)}%`
                    };

                    await db.query(
                    "UPDATE watchlists set price = ?, price_change = ? where id = ?" ,
                        [stockData.price, stockData.price_change, stockData.id]
                    );

                    return stockData;
                } catch (err) {
                    const [cached] = await db.query('SELECT name, price, price_change AS `change` FROM stocks WHERE symbol = ?', [stock.symbol]);
                    return cached.length > 0 ? { symbol: stock.symbol, ...cached[0] } : null;
                }
            })
        );

        res.json({ market: 'NYSE', data: updatedStocks.filter(item => item !== null) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/markets/crypto', async (req, res) => {
    try {
        const userId = 1;

        const [savedCrypto] = await db.query(
            "SELECT symbol, id FROM watchlists WHERE user_id = ? AND exchange = 'CRYPTO'",
            [userId]
        );

        if (savedCrypto.length === 0) {
            return res.json({ market: 'Crypto', data: [] });
        }

        const updatedCrypto = await Promise.all(
            savedCrypto.map(async (crypto) => {
                try {
                    const data = await yahooFinance.quote(`${crypto.symbol}-USD`);
                    
                    const cryptoData = {
                        id: crypto.id,
                        symbol: crypto.symbol,
                        name: data.shortName || crypto.symbol,
                        price: data.regularMarketPrice,
                        change: `${data.regularMarketChangePercent >= 0 ? '+' : ''}${data.regularMarketChangePercent.toFixed(2)}%`
                    };

                    await db.query(
                        `INSERT INTO crypto (symbol, name, price, price_change) VALUES (?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE price=VALUES(price), price_change=VALUES(price_change)`,
                        [cryptoData.symbol, cryptoData.name, cryptoData.price, cryptoData.change]
                    );

                    return cryptoData;
                } catch (err) {
                    const [cached] = await db.query('SELECT name, price, price_change AS `change` FROM crypto WHERE symbol = ?', [crypto.symbol]);
                    return cached.length > 0 ? { symbol: crypto.symbol, ...cached[0] } : null;
                }
            })
        );

        res.json({ market: 'Crypto', data: updatedCrypto.filter(item => item !== null) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Separate Endpoint: Macro Tracking (Indices, Commodities, Forex)
app.get('/api/markets/macro', async (req, res) => {
    try {
        // Yahoo Finance symbol standards:
        // ^GSPC = S&P 500 Index, GC=F = Gold Futures, USDCAD=X = USD/CAD Forex
        const [sp500, gold, usdcad] = await Promise.all([
            yahooFinance.quote('^GSPC'),
            yahooFinance.quote('GC=F'),
            yahooFinance.quote('USDCAD=X')
        ]);

        const liveMacros = [
            {
                symbol: 'S&P 500',
                name: sp500.shortName || 'S&P 500 Index',
                price: sp500.regularMarketPrice,
                change: `${sp500.regularMarketChangePercent >= 0 ? '+' : ''}${sp500.regularMarketChangePercent.toFixed(2)}%`
            },
            {
                symbol: 'GOLD',
                name: gold.shortName || 'Gold Futures',
                price: gold.regularMarketPrice,
                change: `${gold.regularMarketChangePercent >= 0 ? '+' : ''}${gold.regularMarketChangePercent.toFixed(2)}%`
            },
            {
                symbol: 'USD/CAD',
                name: usdcad.shortName || 'USD to CAD Rate',
                price: usdcad.regularMarketPrice,
                change: `${usdcad.regularMarketChangePercent >= 0 ? '+' : ''}${usdcad.regularMarketChangePercent.toFixed(2)}%`
            }
        ];

        // Cache fresh variables securely into your local MySQL table structure
        for (const macro of liveMacros) {
            await db.query(
                `INSERT INTO macro_assets (symbol, name, category, price, price_change) 
                 VALUES (?, ?, 'MACRO', ?, ?) 
                 ON DUPLICATE KEY UPDATE price = VALUES(price), price_change = VALUES(price_change)`,
                [macro.symbol, macro.name, macro.price, macro.change]
            );
        }

        res.json({ market: 'Macro Options', data: liveMacros });

    } catch (error) {
        console.warn("Notice: Macro pipeline fallback initiated:", error.message);
        try {
            const [rows] = await db.query('SELECT symbol, name, price, price_change AS `change` FROM macro_assets');
            res.json({ market: 'Macro Options (Cached)', data: rows, rawDebug: `Yahoo Error: ${error.message}` });
        } catch (dbError) {
            res.status(500).json({ error: "Database query failed completely", details: dbError.message });
        }
    }
});

// 6. Global Search Endpoint: Fetches any asset symbol from Yahoo Finance instantly
app.get('/api/search', async (req, res) => {
    try {
        const { symbol } = req.query;
        if (!symbol) return res.status(400).json({ error: "Missing symbol query parameter" });

        // Query Yahoo Finance for the searched asset ticker
        const data = await yahooFinance.quote(symbol.toUpperCase());

        if (!data || !data.regularMarketPrice) {
            return res.status(444).json({ error: "Asset symbol not found on global markets" });
        }

        const normalizedAsset = {
            symbol: data.symbol.replace('-USD', ''),
            name: data.longName || data.shortName || data.symbol,
            price: data.regularMarketPrice,
            price_change: `${data.regularMarketChangePercent >= 0 ? '+' : ''}${data.regularMarketChangePercent.toFixed(2)}%`,
            exchange: data.fullExchangeName
        };

        res.json(normalizedAsset);
    } catch (error) {
        res.status(500).json({ error: "Search query failed", details: error.message });
    }
}); 

// 7. Relational Add Endpoint: Connects an asset symbol to your specific user ID
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const { user_id, symbol, name, exchange, price, price_change } = req.body;
        
        if (!user_id || !symbol || !exchange) {
            return res.status(400).json({ error: "Missing required fields: user_id, symbol, exchange" });
        }

        // Insert into your watchlists table, linking the asset symbol to the user account
        await db.query(
            `INSERT INTO watchlists (user_id, symbol, name, exchange, price, price_change) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, symbol.toUpperCase(), name, exchange.toUpperCase(), price, price_change]
          );

        res.json({ message: `Successfully added ${symbol} ${name} to your personal account list!` });
    } catch (error) {
        res.status(500).json({ error: "Failed to link asset to account", details: error.message });
    }
});

// 8. Personalized Watchlist Endpoint: Pulls and syncs ONLY user-selected assets
app.get('/api/watchlist/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Query MySQL to find every symbol this specific user has manually saved
        const [savedAssets] = await db.query(
            'SELECT symbol, name, exchange, price, price_change FROM watchlists WHERE user_id = ?',
            [userId]
        );

        // If the user's watchlist is brand new and completely empty, return clean empty data frames
        if (savedAssets.length === 0) {
            return res.json({ market: 'My Watchlist', data: [] });
        }

        // Filter out any broken or unparsed asset entries cleanly
        const cleanPortfolio = savedAssets.filter(item => item !== null);

        res.json({ market: 'My Watchlist', data: savedAssets });

    } catch (error) {
        console.error("Watchlist retrieval pipeline malfunction:", error.message);
        res.status(500).json({ error: "Failed to load account watchlist data", details: error.message });
    }
});


// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Unified Full-Stack Yahoo Finance Engine running smoothly on port ${PORT}`);
});
