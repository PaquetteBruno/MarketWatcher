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
        // The API route now only reads directly from your fast MySQL memory!
        const [globals] = await db.query(
            "SELECT id, symbol, name, price, price_change FROM globals WHERE show_on_banner = 1"
        );
        res.json({ market: "global", data: globals });
    } catch (error) {
        console.error("Error retrieving market banner data:", error.message);
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
                    asset_type: isCrypto ? 'CRYPTO' : (item.asset_type === 'NMS' ? 'NASDAQGS' : item.asset_type)
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
    const { symbol, user_id } = req.body;
    
    // 1. Fetch live data and format our inputs cleanly up front
    const liveGlobal = await yahooFinance.quote(symbol);
    const symbolUpper = symbol.toUpperCase();
    const asset_typeUpper = req.body.asset_type ? req.body.asset_type.toUpperCase() : 'UNKNOWN';

    // Calculate price change string outside of the query payload
    const pct = liveGlobal.regularMarketChangePercent;
    const priceChangeStr = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;

    let assetId;
    let portfolio_asset_id;
    
    // 2. Check if the asset already exists in our master Assets table
    const [assets] = await db.query('SELECT id FROM Assets WHERE symbol = ?', [symbolUpper]);

    if (assets.length === 0) {
      // Create asset if it doesn't exist
      const [insertResult] = await db.query(
        "INSERT INTO Assets (symbol, name, asset_type, price, price_change) VALUES (?, ?, ?, ?, ?)",
        [symbolUpper, liveGlobal.shortName, asset_typeUpper, liveGlobal.regularMarketPrice, priceChangeStr]
      );
      assetId = insertResult.insertId;
    } else {
      // Use existing asset ID
      assetId = assets[0].id;
    }

    // 3. Securely look up the user's portfolio ID
    const [portfolios] = await db.query("SELECT id FROM portfolios WHERE user_id = ?", [user_id]);

    // Safety guard: If no portfolio exists, create one or throw a clear error
    if (portfolios.length === 0) {
      return res.status(404).json({ error: "PORTFOLIO_NOT_FOUND", details: "User does not have an active portfolio space." });
    }
    const portfolioId = portfolios[0].id;

    const [portfolio_assetResult] = await db.query(
        "INSERT INTO portfolio_asset (portfolio_id, asset_id) VALUES (?, ?)",
        [portfolioId, assetId]
      );

      portfolio_asset_id = [portfolio_assetResult][0].insertId;

    // 4. Link the asset to the user's watchlist portfolio
    await db.query(
      "INSERT INTO watchlists (portfolio_asset_id) VALUES (?)",
      [portfolio_asset_id]
    );

    res.json({ message: "ASSET_SUCCESSFULLY_ADDED" });

  } catch (error) {
    console.error("Watchlist error detailed logs:", error);
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

app.post('/api/portfolio/add-position', async (req, res) => {
    try {
        const { portfolio_asset_id, quantity, purchase_price } = req.body;

        // Enforce that values default cleanly to avoid SQL calculation errors
        const qty = quantity || 0;
        const price = purchase_price || 0.00;

        // Inserts a standalone position block allowing the multi-lot tracking you wanted
        await db.query(
            "INSERT INTO positions (portfolio_asset_id, quantity, purchase_price) VALUES (?, ?, ?)",
            [portfolio_asset_id, qty, price]
        );

        res.json({ message: "POSITION_RECORDED_SUCCESSFULLY" });
    } catch (error) {
        console.error("Error creating stock position lot:", error.message);
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
});

app.post('/api/portfolio/add-asset', async (req, res) => {
    try {
        const { user_id, symbol, name, asset_type, price, price_change } = req.body;
        const assetSymbolUpper = symbol.toUpperCase();

        // Step 1: Ensure asset exists in our main assets directory
        let [assetsRows] = await db.query("SELECT id FROM assets WHERE symbol = ?", [assetSymbolUpper]);
        let assetId;

        if (assetsRows.length === 0) {
            // First time anyone has added this asset globally
            const [insertAsset] = await db.query(
                "INSERT INTO assets (symbol, name, asset_type, price, price_change) VALUES (?, ?, ?, ?, ?, ?)",
                [assetSymbolUpper, name, asset_type, price, price_change] // Default global_id to 1 or adjust as needed
            );
            assetId = insertAsset.insertId;
        } else {
            assetId = assetsRows[0].id;
        }

        // Step 2: Find the user's active portfolio (NEW JOIN LOGIC)
        // We look directly into portfolios where user_id matches
        let [portfolioRows] = await db.query("SELECT id FROM portfolios WHERE user_id = ?", [user_id]);
        let portfolioId;

        if (portfolioRows.length === 0) {
            // Safe fallback: If user doesn't have an active portfolio entry yet, create one
            const [insertPortfolio] = await db.query(
                "INSERT INTO portfolios (user_id, name) VALUES (?, 'My First Portfolio')",
                [user_id]
            );
            portfolioId = insertPortfolio.insertId;
        } else {
            portfolioId = portfolioRows[0].id;
        }

        // Step 3: Link the asset to the portfolio inside portfolio_asset
        // The UNIQUE constraint we added ensures they can't duplicate the link
        let [existingLink] = await db.query(
            "SELECT id FROM portfolio_asset WHERE portfolio_id = ? AND asset_id = ?",
            [portfolioId, assetId]
        );

        let portfolioAssetId;
        if (existingLink.length === 0) {
            const [insertLink] = await db.query(
                "INSERT INTO portfolio_asset (portfolio_id, asset_id) VALUES (?, ?)",
                [portfolioId, assetId]
            );
            portfolioAssetId = insertLink.insertId;
        } else {
            portfolioAssetId = existingLink[0].id;
        }

        // Optional Step 4: If this action came from your Watchlist view, map it to the watchlists table
        await db.query(
            "INSERT IGNORE INTO watchlists (portfolio_asset_id) VALUES (?)",
            [portfolioAssetId]
        );

        res.json({ message: "ASSET_SUCCESSFULLY_ADDED", portfolioAssetId });
    } catch (error) {
        console.error("Error in add-asset route:", error.message);
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

// Helper to fetch live market benchmark data and sync to MySQL
async function updateGlobalPrices() {
    try {
        // Query symbols designated for the marquee banner layout
        const [rows] = await db.query("SELECT symbol FROM globals WHERE show_on_banner = 1");
        
        if (rows.length === 0) return;

        const symbols = rows.map(r => r.symbol);

        // Fetch metrics concurrently using yahoo-finance2
        const quotes = await yahooFinance.quote(symbols);

        // Map responses for fast, resilient lookups
        const quoteMap = {};
        if (Array.isArray(quotes)) {
            quotes.forEach(q => { if (q?.symbol) quoteMap[q.symbol.toLowerCase()] = q; });
        } else if (quotes?.symbol) {
            quoteMap[quotes.symbol.toLowerCase()] = quotes;
        }

        // Cycle elements and safely synchronize database states
        for (const symbol of symbols) {
            const liveData = quoteMap[symbol.toLowerCase()];
            if (!liveData) continue;

            const price = liveData.regularMarketPrice || 0;
            const changePercent = liveData.regularMarketChangePercent || 0;

            // Generate clean frontend-friendly structural string indicators (+X.XX% / -X.XX%)
            const sign = changePercent >= 0 ? "+" : "";
            const price_change = `${sign}${changePercent.toFixed(2)}%`;

            await db.query(
                "UPDATE globals SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP WHERE symbol = ?",
                [price, price_change, symbol]
            );
        }
        console.log(`[${new Date().toLocaleTimeString()}] Global ticker benchmarks synced successfully.`);
    } catch (error) {
        console.error("Cron worker error fetching Yahoo Finance symbols:", error.message);
    }
}

async function getAssets(userId, asset_type, res) {
    try {       
        const params = [userId];

        // Paths fixed to leverage your streamlined portfolio_asset bridge table
        let sql = `SELECT assets.id, assets.symbol 
                     FROM watchlists
                     JOIN portfolio_asset ON watchlists.portfolio_asset_id = portfolio_asset.id
                     JOIN portfolios ON portfolio_asset.portfolio_id = portfolios.id
                     JOIN assets ON portfolio_asset.asset_id = assets.id
                    WHERE portfolios.user_id = ?`;
 
        if (asset_type !== null && asset_type !== undefined) {
            sql += ` AND assets.asset_type = ?`;
            params.push(asset_type);
        }

        const [assets] = await db.query(sql, params);

        if (assets.length === 0) {
            return res.json({ market: asset_type, data: [] });
        }

        // Loop over the tracked assets to grab live data snapshots
        for (const asset of assets) {
            try {
                const liveAsset = await yahooFinance.quote(asset.symbol);
                
                if (liveAsset) {
                    asset.price = liveAsset.regularMarketPrice || 0;
                    const changePercent = liveAsset.regularMarketChangePercent || 0;
                    asset.price_change = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

                    // Push updates down to database core
                    await db.query(
                        "UPDATE assets SET price = ?, price_change = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
                        [asset.price, asset.price_change, asset.id]
                    );
                }
            } catch (yahooErr) {
                // Safeguard: If a single asset fails or has an invalid symbol, don't crash the whole route
                console.error(`Skipping live sync for symbol ${asset.symbol}:`, yahooErr.message);
            }
        }                
        
        res.json({ market: asset_type, data: assets });
    }
    catch (error) {
        console.error(`Error while retrieving stocks for user ${userId}`, error.message);
        res.status(500).json({ error: "DB_CONNECTION_ERROR", details: error.message });
    }
}

setInterval(() => {
    updateGlobalPrices();
}, 300000);

// Run a manual boot-sync once right when your Node.js engine boots up
updateGlobalPrices();

// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
