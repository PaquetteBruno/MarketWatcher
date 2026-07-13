import express from "express";
import {
  getPortfolioAssets,
  getActivePortfolio,
  addAssetToPortfolio,
  addTransactionPosition,
  updateSelectedPortfolio,
  removeAssetFromPortfolio,
} from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/:id", getPortfolioAssets);

router.get("/active/:id", getActivePortfolio);

router.post("/add-asset", addAssetToPortfolio);

router.post("/add-position", addTransactionPosition);

router.post("/update-selected", updateSelectedPortfolio);

router.delete("/remove-asset", removeAssetFromPortfolio);

export default router;
