import express from "express";
import { getGlobalPrices } from "../controllers/globalController.js";

const router = express.Router();

router.get("/", getGlobalPrices);

export default router;
