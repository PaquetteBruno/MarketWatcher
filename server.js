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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Splits "Bearer <TOKEN>"

    if (!token) {
        return res.status(401).json({ error: "AUTH_MISSING_TOKEN" });
    }

    try {
        // Decrypt the token using your secure key secret
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Binds the decrypted { id, username } right onto the request object!
        next(); // Safely pass execution forward to your database route
    } catch (error) {
        res.status(403).json({ error: "AUTH_TOKEN_INVALID" });
    }
};

app.get('/api/watchlist/user/:id', async (req, res) => {
    getAssets(req.params.id, null, res);   
});

app.get('/api/markets/nasdaq', authenticateToken, async (req, res) => {
    getAssets(req.user.id, "NASDAQGS", res);
});

app.get('/api/markets/nyse', authenticateToken, async (req, res) => {
    getAssets(req.user.id, "NYQ", res);
});

app.get('/api/markets/crypto', authenticateToken, async (req, res) => {
    getAssets(req.user.id, "CRYPTO", res);
});

app.get('/api/markets/global', async (req, res) => {
    try {

        const [globals] = await db.query("SELECT id, symbol, name, price, price_change FROM globals");

        for (const global of globals) {
            const liveGlobal = await yahooFinance.quote(global.symbol);

            global.price = liveGlobal.regularMarketPrice;
            global.price_change = `${liveGlobal.regularMarketChangePercent >= 0 ? '+' : ''}${liveGlobal.regularMarketChangePercent.toFixed(2)}%`

            await db.query(
                "update globals set price = ?, price_change = ? where id = ?",
                [global.price, global.price_change, global.id]
            );
        }

        res.json({ market: 'global', data: globals.filter(item => item !== null)  });

    } catch (error) {
        console.error("Error while retrieving global data", error.message);
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
});

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

app.post('/api/watchlist/add', async (req, res) => {
    try {
        const liveGlobal = await yahooFinance.quote(req.body.symbol);

        let assetId;
        const [asset] = await db.query(`SELECT id, symbol FROM Assets where symbol = ?`, [liveGlobal.symbol.toUpperCase()]);

        if (asset.length === 0) {
            const [result] = await db.query(
                "INSERT INTO Assets (symbol, name, exchange, price, price_change) VALUES (?, ?, ?, ?, ?)",
                [
                    req.body.symbol.toUpperCase(), 
                    liveGlobal.shortName, 
                    req.body.exchange.toUpperCase(), 
                    liveGlobal.regularMarketPrice, 
                    `${liveGlobal.regularMarketChangePercent >= 0 ? '+' : ''}${liveGlobal.regularMarketChangePercent.toFixed(2)}%`
                ]
            );

            assetId = result.insertId;
        }
        else {
            assetId = asset[0].id;
        }

        const [portfolio] = await db.query("SELECT id from portfolios where user_id = ?", [req.body.user_id])

        await db.query(
            "INSERT INTO watchlists (asset_id, portfolio_id) VALUES (?, ?)",
            [
                assetId,
                portfolio[0].id                
            ]
        );

        res.json({ message: "ASSET_SUCCESSFULLY_ADDED" });
    } catch (error) {
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
});

app.delete('/api/watchlist/remove', async (req, res) => {
    try {
        const { user_id, symbol } = req.body;
        
        if (!user_id || !symbol) {
            return res.status(400).json({ error: "MISSING_FIELDS" });
        }

        // Execute targeted deletion query to unpin the row asset from the user account link
        const [result] = await db.query(
            "DELETE FROM watchlists WHERE user_id = ? AND symbol = ?",
            [user_id, symbol.toUpperCase()]
        );

        res.json({ message: "ASSET_SUCCESSFULLY_REMOVED" + `|[${symbol}]` });
    } catch (error) {
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "AUTH_INVALID_CREDENTIALS" });
        }

        // Cryptographically hash the password before it ever touches your database logs
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            `INSERT INTO users (username, email, password_hash, auth_provider) VALUES (?, ?, ?, 'local')`,
            [username, email, passwordHash]
        );

        await db.query(
            `INSERT INTO portfolios (user_id, name) VALUES (?, 'New')`,
            [result.insertId]
        );

        res.status(201).json({ message: "ACCOUNT_SUCCESSFULLY_GENERATED" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "AUTH_USER_EXISTS" });
        }
        res.status(500).json({ error: "AUTH_FAILED", details: error.message });
    }
});

// Local Login Endpoint: Verifies credentials and hands back a secure JWT token passport
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ error: "AUTH_INVALID_CREDENTIALS" });
        }

        // Query the DB to check if the user profile exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: "AUTH_INVALID_CREDENTIALS" });
        }

        const user = users[0];

        // Security Check: If they log in via local form but registered via social OAuth, redirect them
        if (user.auth_provider !== 'local') {
            return res.status(400).json({ error: "AUTH_EMAIL_TAKEN" });
        }

        // Compare the submitted password string with the database hash key securely
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "AUTH_INVALID_EMAIL_OR_PASSWORD" });
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
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
    }
});

// Google OAuth Authentication Endpoint: Verifies OIDC tokens and registers/logs in social profiles
app.post('/api/auth/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "MISSING_GOOGLE_ID" });
        }

        // 1. Validate the token signature directly against Google's security servers
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload; // Extract Google user profile metadata safely!

        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        let user;

        if (existingUsers.length === 0) {
            const [insertResult] = await db.query(
                `INSERT INTO users (username, email, auth_provider, avatar_url) VALUES (?, ?, 'google', ?)`,
                [name, email, picture]
            );

            await db.query(
                `INSERT INTO portfolios (user_id, name) VALUES (?, 'New')`,
                [insertResult.insertId]
            );

            user = {
                id: insertResult.insertId,
                username: name,
                email: email,
                avatar_url: picture
            };

            console.log("GOOGLE_ACCOUNT_CREATED" + `|${name}`);
        } else {
            user = existingUsers[0];
            
            // Security check: If they registered locally but tried to use Google social sign-in, manage the overlap safely
            if (user.auth_provider !== 'google') {
                return res.status(400).json({ error: "AUTH_EMAIL_TAKEN" });
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
        res.status(500).json({ error: "GOOGLE_VERIFICATION_FAILED", details: error.message });
    }
});

async function getAssets(userId, exchange, res) {
    try {       
        const params = [userId];

        let sql = `SELECT assets.id, assets.symbol 
                     FROM watchlists
                     JOIN portfolios on watchlists.portfolio_id = portfolios.id
                     JOIN assets ON watchlists.asset_id = assets.id
                    WHERE portfolios.user_id = ?
                     `;
 
        if (exchange !== null && exchange !== undefined) {
            sql += ` AND assets.exchange = ?`;
            params.push(exchange);
        }

        const [assets] = await db.query(sql, params);

        if (assets.length === 0) {
            return res.json({ market: {exchange}, data: [] });
        }

        for (const asset of assets) {
            const liveAsset = await yahooFinance.quote(asset.symbol);

            asset.price = liveAsset.regularMarketPrice;
            asset.price_change = `${liveAsset.regularMarketChangePercent >= 0 ? '+' : ''}${liveAsset.regularMarketChangePercent.toFixed(2)}%`

            await db.query("update assets set price = ?, price_change = ? where id = ?", [asset.price, asset.price_change, asset.id]);
        }                
        
        res.json({ market: {exchange}, data: assets.filter(item => item !== null)  });
    }
    catch (error) {
        console.error(`Error while retrieving stocks for user ${userId}`, error.message);
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
}

// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
