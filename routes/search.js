import express from "express";

import { searchAssets } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", searchAssets);

export default router;
