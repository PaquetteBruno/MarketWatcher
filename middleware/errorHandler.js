import logger from "../config/logger.js";

export default function errorHandler(err, req, res, _next) {
  logger.error({
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    error: err.code || "INTERNAL_SERVER_ERROR",
  });
}
