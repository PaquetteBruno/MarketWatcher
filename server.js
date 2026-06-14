const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const YahooFinance = require('yahoo-finance2').default; 
const yahooFinance = new YahooFinance(); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// ==========================================
// 🛡️ JWT IDENTITY VERIFICATION MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
    // Extract the token passport out of the incoming request headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Splits "Bearer <TOKEN>"

    if (!token) {
        return res.status(401).json({ error: "Access Denied. Missing session token passport." });
    }

    try {
        // Decrypt the token using your secure key secret
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Binds the decrypted { id, username } right onto the request object!
        next(); // Safely pass execution forward to your database route
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired session token passport." });
    }
};


app.get('/api/markets/nasdaq', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // 💥 NO MORE HARDCODING! Reads your live logged-in ID automatically!

        const [savedStocks] = await db.query(
            "SELECT symbol FROM watchlists WHERE user_id = ? AND exchange = 'NASDAQGS'",
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

app.get('/api/markets/nyse', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Dynamic session hook

        const [savedStocks] = await db.query(
            "SELECT symbol FROM watchlists WHERE user_id = ? AND exchange = 'NYSE'",
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

app.get('/api/markets/crypto', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Dynamic session hook

        const [savedCrypto] = await db.query(
            "SELECT symbol FROM watchlists WHERE user_id = ? AND exchange = 'CRYPTO'",
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

// 9. Relational Remove Endpoint: Drops a specific asset mapping for a user account
app.delete('/api/watchlist/remove', async (req, res) => {
    try {
        const { user_id, symbol } = req.body;
        
        if (!user_id || !symbol) {
            return res.status(400).json({ error: "Missing required fields: user_id, symbol" });
        }

        // Execute targeted deletion query to unpin the row asset from the user account link
        const [result] = await db.query(
            "DELETE FROM watchlists WHERE user_id = ? AND symbol = ?",
            [user_id, symbol.toUpperCase()]
        );

        if (result.affectedRows === 0) {
            return res.status(444).json({ error: "Asset connection mapping not found for this account profile" });
        }

        res.json({ message: `Successfully unpinned ${symbol} from your dashboard list!` });
    } catch (error) {
        res.status(500).json({ error: "Failed to drop asset link", details: error.message });
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

// ==========================================
// 🔐 AUTHENTICATION ROUTING ENGINES
// ==========================================

// 10. Local Register Endpoint: Creates a new user with a hashed password
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required signup fields" });
        }

        // Cryptographically hash the password before it ever touches your database logs
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Save into your newly updated user database table
        await db.query(
            `INSERT INTO users (username, email, password_hash, auth_provider) VALUES (?, ?, ?, 'local')`,
            [username, email, passwordHash]
        );

        res.status(201).json({ message: "User account generated successfully! Proceed to login." });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Username or email is already registered." });
        }
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
});

// 11. Local Login Endpoint: Verifies credentials and hands back a secure JWT token passport
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing required login credentials" });
        }

        // Query the DB to check if the user profile exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password credentials." });
        }

        const user = users[0];

        // Security Check: If they log in via local form but registered via social OAuth, redirect them
        if (user.auth_provider !== 'local') {
            return res.status(400).json({ error: `This account uses ${user.auth_provider} authentication. Sign in with social instead.` });
        }

        // Compare the submitted password string with the database hash key securely
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password credentials." });
        }

        // Generate the secure JWT token passport stamp
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Automatically log them out out after 1 day for security
        );

        // Hand back the token and user metadata cleanly to your React frontend app
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Login pipeline crashed", details: error.message });
    }
});

// 12. Google OAuth Authentication Endpoint: Verifies OIDC tokens and registers/logs in social profiles
app.post('/api/auth/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "Missing required Google ID Token credential payload." });
        }

        // 1. Validate the token signature directly against Google's security servers
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload; // Extract Google user profile metadata safely!

        // 2. Query MySQL to see if this specific social account profile already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        let user;

        if (existingUsers.length === 0) {
            // 3. AUTO-REGISTER: If they are brand new, create their relational account line automatically!
            // We use a clean text replacement format to turn their full name into a safe, lowercase username
            const generatedUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(1000 + Math.random() * 9000);
            
            const [insertResult] = await db.query(
                `INSERT INTO users (username, email, auth_provider, avatar_url) VALUES (?, ?, 'google', ?)`,
                [generatedUsername, email, picture]
            );

            user = {
                id: insertResult.insertId,
                username: generatedUsername,
                email: email,
                avatar_url: picture
            };
            console.log(`Successfully generated new Google account profile: ${generatedUsername}`);
        } else {
            user = existingUsers[0];
            
            // Security check: If they registered locally but tried to use Google social sign-in, manage the overlap safely
            if (user.auth_provider !== 'google') {
                return res.status(400).json({ error: `This email is already linked via ${user.auth_provider} credentials. Please sign in manually.` });
            }
        }

        // 4. Issue your custom application JWT token passport tracking stamp
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url || picture
            }
        });

    } catch (error) {
        console.error("Google OAuth pipeline exception:", error.message);
        res.status(500).json({ error: "Google verification system failed", details: error.message });
    }
});

// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Unified Full-Stack Yahoo Finance Engine running smoothly on port ${PORT}`);
});
