import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'; // 🔌 Core engine class

// 🚀 INITIALIZE COURIER INSTANCE GLOBALLY AT THE ROOT OF THE FILE SCOPE
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =========================================================================
// 👤 USER REGISTRATION CONTROLLER ACTION
// =========================================================================
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Fail Fast Input Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
        }

        // 2. Business Logic Guard: Check if user already exists
        const emailExists = await User.findByEmail(email);
        const usernameExists = await User.findByUsername(username);

        if (emailExists || usernameExists) {
            return res.status(409).json({ error: "USER_ALREADY_EXISTS" });
        }

        // 3. Coordinate with database abstraction layer (Model)
        // Note: You should wrap the password string with a hash helper here before saving!
        const userId = await User.create({ username, email, password });

        // 4. Return structural success response payload
        res.status(201).json({
            message: "USER_REGISTERED_SUCCESSFULLY",
            data: { id: userId, username, email }
        });
    } catch (error) {
        console.error("Controller Registration Exception Loop:", error.message);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
    }
};

// =========================================================================
// 🔐 USER LOGIN / REFRESH TOKEN CONTROLLER ACTION
// =========================================================================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Fail Fast Input Validation
        if (!email || !password) {
            return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
        }

        // 2. Fetch User Object Record Entity from Database via Model
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "INVALID_CREDENTIALS" });
        }

        const portfolio = await portfolio.findByUserId(user.id);
        if (!portfolio) {
            return res.status(401).json({ error: "PORTFOLIO_NOT_FOUND" });
        }

        // 3. Security Check: Password verification
        // Replace with your real comparison code when ready (e.g., bcrypt.compare)
        const isPasswordValid = (password === user.password_hash); 
        if (!isPasswordValid) {
            return res.status(401).json({ error: "INVALID_CREDENTIALS" });
        }

        // 4. Clear confidential data from the response target variable object
        delete user.password_hash;

        // 5. Build dynamic session signature token string
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username, portfolioId: portfolio.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        res.status(200).json({
            message: "AUTHENTICATION_SUCCESSFUL",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                portfolioId: portfolio.id,
                email: user.email,
                avatar_url: user.avatar_url
            }
        });

    } catch (error) {
        console.error("Controller Login Exception Loop:", error.message);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", details: error.message });
    }
};

// =========================================================================
// 🌐 SECURE GOOGLE OAUTH AUTHENTICATION CONTROLLER ACTION
// =========================================================================
export const googleLoginUser = async (req, res) => {
    try {
        // 1. Extract the secure token string from your observed frontend payload body structure
        const { idToken } = req.body; 

        if (!idToken) {
            return res.status(400).json({ error: "GOOGLE_ID_TOKEN_MISSING" });
        }

        // 2. Verify the payload directly with Google's servers
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        // 3. Extract the clean user credentials from the verified token object
        const email = payload.email;
        const name = payload.name;
        const avatar_url = payload.picture;

        if (!email) {
            return res.status(400).json({ error: "GOOGLE_AUTH_EMAIL_MISSING" });
        }

        // 4. Check if the user already exists in your MySQL directory
        let user = await User.findByEmail(email);

        // 5. Auto-register first-time Google sign-ups
        if (!user) {
            const generatedUsername = name ? name.toLowerCase().replace(/\s+/g, '_') : `user_${Date.now()}`;
            const randomPasswordPlaceholder = `google_oauth_lock_${Math.random().toString(36).slice(-8)}`;

            const userId = await User.create({
                username: generatedUsername,
                email: email,
                password: randomPasswordPlaceholder,
                po
            });

            user = await User.findById(userId);
        }

        const portfolio = await Portfolio.findByUserId(user.id);
        if (!portfolio) {
            return res.status(401).json({ error: "PORTFOLIO_NOT_FOUND" });
        }

        // 6. Generate your real secure app JWT access token
        const sessionToken = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 7. Return payload parameters to fulfill your frontend login state hooks
        res.status(200).json({
            message: "AUTHENTICATION_SUCCESSFUL",
            token: sessionToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                portfolioId: portfolio.id,
                avatar_url: avatar_url || user.avatar_url
            }
        });
    } catch (error) {
        console.error("Controller Google Login Verification Error:", error.messsage);
        res.status(500).json({ error: "GOOGLE_AUTH_VERIFICATION_FAILED", details: error.message });
    }
};
