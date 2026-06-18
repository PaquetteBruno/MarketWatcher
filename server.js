import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// 🔌 IMPORT YOUR LOGICAL ROUTER ARCHITECTURE
import { specs } from './config/swagger.js';
import authRoutes from './routes/auth.js';
import globalRoutes from './routes/global.js';
import portfolioRoutes from './routes/portfolio.js';

// Load environmental parameters from your root .env file
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
// Open your browser and visit: http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// =========================================================================
// 🗺️ REGISTER ENDPOINT TRAFFIC ROUTERS
// =========================================================================
// These map your modular router files and auto-prefix the base endpoint URLs
app.use('/api/auth', authRoutes);              // Maps -> /api/auth/register, /api/auth/login
app.use('/api/global', globalRoutes);         // Maps -> /api/global
app.use('/api/portfolio', portfolioRoutes);    // Maps -> /api/portfolio/add-asset, /api/portfolio/add-position

// =========================================================================
// 🚀 FUTURE MULTI-SITE / APP COMPATIBILITY ZONE
// =========================================================================
// When you start your second project on this same server to save on host bills,
// you can just mount its dedicated route script on a single line right here!
// app.use('/api/project_two', projectTwoRouter);

// =========================================================================
// 🏁 SERVER DAEMON LAUNCH ENGINE
// =========================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 MARKET WATCHER FULL-STACK ENGINE ONLINE`);
    console.log(`📡 Listening on Port: ${PORT}`);
    console.log(`📝 Interactive API Spec Dashboard: http://localhost:5000/api-docs`);
    console.log(`=============================================================\n`);
});
