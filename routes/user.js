import express from "express";

import { getPortfolios } from "../controllers/userController.js";

const router = express.Router();

router.get("/portfolio/:user_id", getPortfolios);

export default router;
