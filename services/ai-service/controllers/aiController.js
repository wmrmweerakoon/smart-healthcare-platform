const SymptomAnalysis = require('../models/SymptomAnalysis');
const { analyzeSymptoms, symptomDatabase } = require('../services/symptomEngine');

// @desc    Analyze symptoms and suggest conditions/doctor type
// @route   POST /analyze-symptoms
exports.analyzeUserSymptoms = async (req, res, next) => {
    try {
        const { symptoms, age, gender } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of symptoms, e.g. ["headache", "fever"]',
            });
        }

        // Run analysis
        const result = analyzeSymptoms(symptoms, age, gender);

        // Persist analysis
        const userId = req.headers['x-user-id'] || 'anonymous';
        const analysis = await SymptomAnalysis.create({
            userId,
            symptoms,
            age: age || null,
            gender: gender || null,
            result,
        });

        res.status(200).json({
            success: true,
            data: {
                analysisId: analysis._id,
                symptoms,
                ...result,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get list of supported symptoms
// @route   GET /symptoms
exports.getSupportedSymptoms = async (req, res) => {
    const symptoms = Object.keys(symptomDatabase).sort();
    res.status(200).json({
        success: true,
        count: symptoms.length,
        data: symptoms,
    });
};

// @desc    Get analysis history for a user
// @route   GET /history
exports.getAnalysisHistory = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] || 'anonymous';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const analyses = await SymptomAnalysis.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SymptomAnalysis.countDocuments({ userId });

        res.status(200).json({
            success: true,
            count: analyses.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: analyses,
        });
    } catch (error) {
        next(error);
    }
};
