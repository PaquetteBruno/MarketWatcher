import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    const emailExists = await User.getByEmail(email);
    const usernameExists = await User.getByUsername(username);

    if (emailExists || usernameExists) {
      return res.status(409).json({ error: "USER_ALREADY_EXISTS" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "USER_REGISTERED_SUCCESSFULLY",
      user: { id: userId, username, email },
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    const user = await User.getByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "AUTH_INVALID_CREDENTIALS" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "AUTH_INVALID_CREDENTIALS" });
    }

    delete user.password_hash;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    const portfolios = await User.getPortfolios(user.id);

    if (!portfolios) {
      return res.status(401).json({ error: "USER_NO_PORTFOLIO" });
    }

    res.status(200).json({
      message: "AUTHENTICATION_SUCCESSFUL",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        portfolios: portfolios,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const googleLoginUser = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "GOOGLE_ID_TOKEN_MISSING" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const avatar_url = payload.picture;

    if (!email) {
      return res.status(400).json({ error: "GOOGLE_AUTH_EMAIL_MISSING" });
    }

    let user = await User.getByEmail(email);

    if (!user) {
      const generatedUsername = name
        ? name.toLowerCase().replace(/\s+/g, "_")
        : `user_${Date.now()}`;

      const randomPasswordPlaceholder = `google_oauth_lock_${Math.random().toString(36).slice(-8)}`;
      const hashedPlaceholder = await bcrypt.hash(
        randomPasswordPlaceholder,
        10,
      );

      const userId = await User.create({
        username: generatedUsername,
        email: email,
        password: hashedPlaceholder,
      });
      user = await User.getById(userId);
    }

    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    const portfolios = await User.getPortfolios(user.id);
    if (!portfolios) {
      return res.status(401).json({ error: "USER_NO_PORTFOLIO" });
    }

    res.status(200).json({
      message: "AUTHENTICATION_SUCCESSFUL",
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: avatar_url || user.avatar_url,
        portfolios: portfolios,
      },
    });
  } catch (err) {
    next(err);
  }
};
