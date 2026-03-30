const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const config = require('./config/config');
const setupRoutes = require('./routes');
const errorHandler = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway is running' });
});

// Setup proxy routes
setupRoutes(app);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Service routes:');
    console.log(`  /api/auth         → ${config.services.auth}`);
    console.log(`  /api/patient      → ${config.services.patient}`);
    console.log(`  /api/doctor       → ${config.services.doctor}`);
    console.log(`  /api/appointment  → ${config.services.appointment}`);
    console.log(`  /api/payment      → ${config.services.payment}`);
    console.log(`  /api/notification → ${config.services.notification}`);
    console.log(`  /api/ai           → ${config.services.ai}`);
});

module.exports = app;
