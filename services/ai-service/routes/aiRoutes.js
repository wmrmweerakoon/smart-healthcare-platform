const express = require('express');
const router = express.Router();
const {
    analyzeUserSymptoms,
    getSupportedSymptoms,
    getAnalysisHistory,
} = require('../controllers/aiController');

// POST /analyze-symptoms — Analyze symptoms and suggest conditions
router.post('/analyze-symptoms', analyzeUserSymptoms);

// GET  /symptoms         — Get list of supported symptoms
router.get('/symptoms', getSupportedSymptoms);

// GET  /history          — Get analysis history for a user
router.get('/history', getAnalysisHistory);

module.exports = router;
