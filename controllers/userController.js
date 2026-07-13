import User from "../models/User.js";

export const getPortfolios = async (req, res, next) => {
  const user_id = req.params.user_id;

  try {
    const [portfolios] = await User.getPortfolios(user_id);

    res.status(200).json({ data: portfolios });
  } catch (err) {
    next(err);
  }
};
