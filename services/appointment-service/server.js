const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
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
    res.status(200).json({ status: 'Appointment Service is running' });
});

// Routes
app.use('/', appointmentRoutes);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`Appointment Service running on port ${PORT}`);
});

module.exports = app;
