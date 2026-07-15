import User from "../models/User.js";

export const getPortfolios = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const [portfolios] = await User.getPortfolios(userId);

    res.status(200).json({ data: portfolios });
  } catch (err) {
    next(err);
  }
};
