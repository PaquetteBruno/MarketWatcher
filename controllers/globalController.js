import Global from "../models/Global.js";

export const getGlobalPrices = async (req, res, next) => {
  try {
    const [result] = await Global.getGlobalPrices();

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
