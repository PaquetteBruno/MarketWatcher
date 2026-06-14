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

// Pull every assets for the signed in user
app.get('/api/watchlist/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {

        // 1. Query MySQL to find every symbol this specific user has manually saved
        const [stocks] = await db.query(
            'SELECT id, symbol FROM watchlists WHERE user_id = ?',
            [userId]
        );

        if (stocks.length === 0) {
            return res.json({ market: 'All', data: [] });
        }

        for (const stock of stocks) {
            let liveStock;
            
            try {
                liveStock = await yahooFinance.quote(stock.symbol);

                stock.price = liveStock.regularMarketPrice;
                stock.price_change = `${liveStock.regularMarketChangePercent >= 0 ? '+' : ''}${liveStock.regularMarketChangePercent.toFixed(2)}%`

                await db.query(
                    "update watchlists set price = ?, price_change = ? where id = ?",
                    [stock.price, stock.price_change, stock.id]
                );
            } catch (error) {
                console.error("Error while retrieving watchlist for user : " + userId, error.message);
                res.status(500).json({ error: "Failed to load account watchlist data", details: error.message });
            }
        }

        res.json({ market: 'All', data: stocks.filter(item => item !== null) });

    } catch (error) {
        console.error("Error while retrieving watchlist for user : " + userId, error.message);
        res.status(500).json({ error: "Failed to load account watchlist data", details: error.message });
    }
});

app.get('/api/markets/nasdaq', authenticateToken, async (req, res) => {
    const userId = req.user.id;    
    
    try {

        const [stocks] = await db.query(
            `SELECT id, symbol FROM watchlists WHERE user_id = ?  AND exchange = 'NASDAQGS'`,
            [userId]
        );

        if (stocks.length === 0) {
            return res.json({ market: 'NASDAQGS', data: [] });
        }

        for (const stock of stocks) {
            const liveStock = await yahooFinance.quote(stock.symbol);

            stock.price = liveStock.regularMarketPrice;
            stock.price_change = `${liveStock.regularMarketChangePercent >= 0 ? '+' : ''}${liveStock.regularMarketChangePercent.toFixed(2)}%`

            await db.query(
                "update watchlists set price = ?, price_change = ? where id = ?",
                [stock.price, stock.price_change, stock.id]
            );
        }

        res.json({ market: 'NASDAQGS', data: stocks.filter(item => item !== null) });

    } catch (error) {
        console.error("Error while retrieving NASDAQGS stocks for user : " + userId, error.message);
        res.status(500).json({ error: "Error while retrieving NASDAQGS stocks for user : " + userId, details: error.message });
    }
});

app.get('/api/markets/nyse', authenticateToken, async (req, res) => {
    const userId = req.user.id;    
    
    try {

        const [stocks] = await db.query(
            `SELECT id, symbol FROM watchlists WHERE user_id = ?  AND exchange = 'NYSE'`,
            [userId]
        );

        if (stocks.length === 0) {
            return res.json({ market: 'NYSE', data: [] });
        }

        for (const stock of stocks) {
            const liveStock = await yahooFinance.quote(stock.symbol);

            stock.price = liveStock.regularMarketPrice;
            stock.price_change = `${liveStock.regularMarketChangePercent >= 0 ? '+' : ''}${liveStock.regularMarketChangePercent.toFixed(2)}%`

            await db.query(
                "update watchlists set price = ?, price_change = ? where id = ?",
                [stock.price, stock.price_change, stock.id]
            );
        }

        res.json({ market: 'NYSE', data: stocks.filter(item => item !== null) });

    } catch (error) {
        console.error("Error while retrieving NYSE stocks for user : " + userId, error.message);
        res.status(500).json({ error: "Error while retrieving NYSE stocks for user : " + userId, details: error.message });
    }
});

app.get('/api/markets/crypto', authenticateToken, async (req, res) => {
    const userId = req.user.id;    
    
    try {
        const [stocks] = await db.query(
            `SELECT id, symbol FROM watchlists WHERE user_id = ?  AND exchange = 'CRYPTO'`,
            [userId]
        );

        if (stocks.length === 0) {
            return res.json({ market: 'NYSE', data: [] });
        }

        for (const stock of stocks) {
            const liveStock = await yahooFinance.quote(stock.symbol);

            stock.price = liveStock.regularMarketPrice;
            stock.price_change = `${liveStock.regularMarketChangePercent >= 0 ? '+' : ''}${liveStock.regularMarketChangePercent.toFixed(2)}%`

            await db.query(
                "update watchlists set price = ?, price_change = ? where id = ?",
                [stock.price, stock.price_change, stock.id]
            );
        }

        res.json({ market: 'CRYPTO', data: stocks.filter(item => item !== null) });

    } catch (error) {
        console.error("Error while retrieving CRYPTO stocks for user : " + userId, error.message);
        res.status(500).json({ error: "Error while retrieving CRYPTO stocks for user : " + userId, details: error.message });
    }
});

// 5. Separate Endpoint: Macro Tracking (Indices, Commodities, Forex)
app.get('/api/markets/macro', async (req, res) => {
    try {

        const [macros] = await db.query("SELECT id, symbol, name, category, price, price_change FROM macro_assets");

        for (const macro of macros) {
            const liveMacro = await yahooFinance.quote(macro.symbol);

            macro.price = liveMacro.regularMarketPrice;
            macro.price_change = `${liveMacro.regularMarketChangePercent >= 0 ? '+' : ''}${liveMacro.regularMarketChangePercent.toFixed(2)}%`

            await db.query(
                "update macro_assets set price = ?, price_change = ? where id = ?",
                [macro.price, macro.price_change, macro.id]
            );
        }

        res.json({ market: 'Macro', data: macros.filter(item => item !== null)  });

    } catch (error) {
        console.error("Error while retrieving MACRO data", error.message);
        res.status(500).json({ error: "Error while retrieving MACRO data", details: error.message });
    }
});

// 6. Global Search Endpoint: Fetches any asset symbol from Yahoo Finance instantly
// 6. Upgraded Multi-Asset Search Endpoint: Scans both Symbols and Names
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: "Missing query parameter" });

        // 1. Call Yahoo Finance's internal search discovery scanner
        const searchResults = await yahooFinance.search(query, { newsCount: 0 });
        
        // If no global instruments match the typed query string, return a clean empty frame
        if (!searchResults || !searchResults.quotes || searchResults.quotes.length === 0) {
            return res.json([]);
        }

        // 2. Filter, clean, and map the top discoveries back to your frontend React layout
        const formattedResults = searchResults.quotes
            .filter(item => item.isYahooFinance && (item.quoteType === 'EQUITY' || item.quoteType === 'CRYPTOCURRENCY'))
            .slice(0, 5) // Limit to the top 5 most relevant global matches
            .map(item => {
                const isCrypto = item.quoteType === 'CRYPTOCURRENCY';
                return {
                    symbol: item.symbol,
                    name: item.shortname || item.longname || item.symbol,
                    exchange: isCrypto ? 'CRYPTO' : (item.exchange === 'NMS' ? 'NASDAQGS' : item.exchange)
/*                     price: item.regularMarketPrice,
                    price_change: `${item.regularMarketChangePercent >= 0 ? '+' : ''}${item.regularMarketChangePercent.toFixed(2)}%` */
                };
            });

        res.json(formattedResults);
    } catch (error) {
        console.error("Autocomplete search error:", error.message);
        res.status(500).json({ error: "Discovery scanner failed", details: error.message });
    }
});


// 7. Relational Add Endpoint: Connects an asset symbol to your specific user ID
app.post('/api/watchlist/add', async (req, res) => {
    try {
        const liveMacro = await yahooFinance.quote(req.body.symbol);

        await db.query(
        `INSERT INTO watchlists (user_id, symbol, name, exchange, price, price_change) VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            price = VALUES(price),
            price_change = VALUES(price_change)`,
        [
            req.body.user_id, 
            liveMacro.symbol.toUpperCase(), 
            liveMacro.shortName, 
            req.body.exchange.toUpperCase(), 
            liveMacro.regularMarketPrice, 
            `${liveMacro.regularMarketChangePercent >= 0 ? '+' : ''}${liveMacro.regularMarketChangePercent.toFixed(2)}%`
        ]
        );

        res.json({ message: `Successfully added ${liveMacro.symbol.toUpperCase()} ${liveMacro.shortName} to your personal account list!` });
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
