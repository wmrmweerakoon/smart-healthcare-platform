const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const patientRoutes = require('./routes/patientRoutes');
const errorHandler = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Patient Service is running' });
});

// Routes
app.use('/', patientRoutes);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Patient Service running on port ${PORT}`);
});

module.exports = app;
