const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');
const { initTransporter } = require('./services/emailService');
const errorHandler = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Notification Service is running' });
});

// Routes
app.use('/', notificationRoutes);

// Global error handler
app.use(errorHandler);

// Initialize email transporter & start server
const PORT = process.env.PORT || 5006;

const startServer = async () => {
    try {
        await initTransporter();
        app.listen(PORT, () => {
            console.log(`Notification Service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize email service:', err.message);
        // Start anyway, emails will init on first send
        app.listen(PORT, () => {
            console.log(`Notification Service running on port ${PORT} (email init deferred)`);
        });
    }
};

startServer();

module.exports = app;
