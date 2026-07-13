import Asset from "../models/Asset.js";
import Portfolio from "../models/Portfolio.js";
import Position from "../models/Position.js";

export const addAssetToPortfolio = async (req, res, next) => {
  try {
    const { portfolio_id, symbol, name, type, price, price_change } = req.body;

    if (!portfolio_id || !symbol) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    let asset_id = await Asset.getIdBySymbol(symbol);

    if (!asset_id) {
      asset_id = await Asset.create({
        symbol,
        name,
        type,
        price,
        price_change,
      });
    }

    await Portfolio.addAssetToPortfolio(portfolio_id, asset_id);

    res.status(201).json({
      message: "ASSET_SUCCESSFULLY_ADDED",
    });
  } catch (err) {
    next(err);
  }
};

export const updateSelectedPortfolio = async (req, res, next) => {
  try {
    const { portfolio_id } = req.body;

    await Portfolio.updateSelectedPortfolio(portfolio_id);

    res.status(201).json({
      message: "SELECTED_PORTFOLIO_CHANGED",
    });
  } catch (err) {
    next(err);
  }
};

export const removeAssetFromPortfolio = async (req, res, next) => {
  try {
    const { portfolio_id, symbol } = req.body;

    await Portfolio.removeAssetFromPortfolio(portfolio_id, symbol);

    res.status(201).json({
      message: "ASSET_SUCCESSFULLY_REMOVED",
      data: { portfolio_id, symbol },
    });
  } catch (err) {
    next(err);
  }
};

export const addTransactionPosition = async (req, res, next) => {
  try {
    const { portfolio_asset_id, quantity, purchase_price } = req.body;

    const qty = parseFloat(quantity);
    const price = parseFloat(purchase_price);

    if (
      !portfolio_asset_id ||
      isNaN(qty) ||
      qty <= 0 ||
      isNaN(price) ||
      price < 0
    ) {
      return res.status(400).json({ error: "INVALID_QUANTITY_OR_PRICE" });
    }

    const positionId = await Position.create({
      portfolioAssetId: portfolio_asset_id,
      quantity: qty,
      purchasePrice: price,
    });

    res.status(201).json({
      message: "POSITION_RECORDED_SUCCESSFULLY",
      data: { positionId },
    });
  } catch (err) {
    next(err);
  }
};

export const getActivePortfolio = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const portfolio = await Portfolio.getActivePortfolio(userId);

    res.status(200).json({ data: portfolio });
  } catch (err) {
    next(err);
  }
};

export const getPortfolioAssets = async (req, res, next) => {
  try {
    const portfolioId = req.params.id;

    const [assets] = await Portfolio.getPortfolioAssets(portfolioId);

    res.status(200).json({ data: assets });
  } catch (err) {
    next(err);
  }
};
