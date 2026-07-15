import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import "express-list-endpoints";
import errorHandler from "./middleware/errorHandler.js";

import { specs } from "./config/swagger.js";
import authRoutes from "./routes/auth.js";
import globalRoutes from "./routes/global.js";
import portfolioRoutes from "./routes/portfolio.js";
import searchRoutes from "./routes/search.js";
import logger from "./config/logger.js";

dotenv.config();

const app = express();

// =========================================================================
// 🛡️ MIDDLEWARE INITIALIZATION
// =========================================================================
app.use(cors());
app.use(express.json()); // Parses incoming JSON request payloads natively

// =========================================================================
// 📝 INTERACTIVE API DOCUMENTATION SERVICE PORTAL (SWAGGER)
// =========================================================================
// http://localhost:5000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// =========================================================================
// 🗺️ REGISTER ENDPOINT TRAFFIC ROUTERS
// =========================================================================
app.use("/api/auth", authRoutes);
app.use("/api/global", globalRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/search", searchRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`MarketWatcher backend running on port: ${PORT}`);

  try {
    const routes = Object.keys(specs.paths);
    console.log(`Found ${routes.length} active documentation paths:\n`);
    routes.forEach((path) => console.log(`📡 [ROUTE] -> ${path}`));
  } catch {
    console.log(
      `Open http://localhost:5000/api-docs in your browser to view routes.`,
    );
  }
});
