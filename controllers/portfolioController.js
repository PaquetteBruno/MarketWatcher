import Asset from "../models/Asset.js";
import Portfolio from "../models/Portfolio.js";

// get a single portfolio by id
export const getPortfolio = async (req, res, next) => {
  try {
    const portfolioID = req.params.portfolioId;

    const portfolio = await Portfolio.getPortfolio(portfolioID);

    res.status(200).json({ data: portfolio });
  } catch (err) {
    next(err);
  }
};

// get a single portfolio by id
export const getSelectedPortfolio = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const portfolio = await Portfolio.getSelectedPortfolio(userId);

    res.status(200).json({ data: portfolio });
  } catch (err) {
    next(err);
  }
};

// get all portfolios from current user
export const getPortfolios = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const portfolios = await Portfolio.getPortfolios(userId);

    res.status(200).json({ data: portfolios });
  } catch (err) {
    next(err);
  }
};

// create a new portfolio for the current user
export const createPortfolio = async (req, res, next) => {
  try {
    const { userId, name, isSelected } = req.params;

    const result = await Portfolio.createPortfolio(userId, name, isSelected);

    req.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

// rename a portfolio by id
export const updatePortfolio = async (req, res, next) => {
  try {
    const { portfolioId, name, isSelected } = req.params;

    const result = await Portfolio.createPortfolio(
      portfolioId,
      name,
      isSelected,
    );

    req.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

// delete a portfolio by id
export const deletePortfolio = async (req, res, next) => {
  try {
    const portfolioId = req.params.id;
    const [result] = await Portfolio.deletePortfolio(portfolioId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

// get all assets for a portfolio
export const getPortfolioAssets = async (req, res, next) => {
  try {
    const portfolioId = req.params.portfolioId;

    const [assets] = await Portfolio.getPortfolioAssets(portfolioId);

    res.status(200).json({ data: assets });
  } catch (err) {
    next(err);
  }
};

// add an asset to a portfolio
export const createPortfolioAsset = async (req, res, next) => {
  try {
    const { portfolioId, symbol, name, type, price, price_change } = req.body;

    if (!portfolioId || !symbol) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    let assetId = await Asset.getIdBySymbol(symbol);

    if (!assetId) {
      assetId = await Asset.create({
        symbol,
        name,
        type,
        price,
        price_change,
      });
    }

    await Portfolio.createPortfolioAsset(portfolioId, assetId);

    res.status(201).json({
      message: "ASSET_SUCCESSFULLY_ADDED",
    });
  } catch (err) {
    next(err);
  }
};

// remove an asset from a portfolio
export const deletePortfolioAsset = async (req, res, next) => {
  try {
    const { portfolioId, symbol } = req.body;

    await Portfolio.deletePortfolioAsset(portfolioId, symbol);

    res.status(201).json({
      message: "ASSET_SUCCESSFULLY_REMOVED",
      data: { portfolioId, symbol },
    });
  } catch (err) {
    next(err);
  }
};
