import User from "../models/User.js";

export const getPortfolios = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [portfolios] = await User.getPortfolios(user_id);

    res.status(200).json({ data: portfolios });
  } catch (error) {
    console.error("userController/getPortfolios/:" + user_id, error.message);
    res
      .status(500)
      .json({ error: "DB_CONNECTION_ERROR", details: error.message });
  }
};
