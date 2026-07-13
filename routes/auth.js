import express from "express";
import {
  registerUser,
  loginUser,
  googleLoginUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/google", googleLoginUser);

export default router;
