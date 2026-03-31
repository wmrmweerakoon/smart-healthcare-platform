const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./utils/errorHandler');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic health check
app.get('/health', (req, res) => res.status(200).json({ status: 'Admin Service Running' }));

// Mount Routes
app.use('/', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare-auth';
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Admin Service: Connected to MongoDB (Auth DB)');
        const PORT = process.env.PORT || 5008;
        app.listen(PORT, () => {
            console.log(`Admin Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Admin Service: MongoDB Connection Error:', err.message);
        process.exit(1);
    });
