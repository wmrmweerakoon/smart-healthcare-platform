const mongoose = require('mongoose');

const symptomAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: 'anonymous',
        },
        symptoms: [{
            type: String,
            required: true,
        }],
        age: {
            type: Number,
            default: null,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', null],
            default: null,
        },
        result: {
            possibleConditions: [{
                condition: String,
                probability: String,
                severity: {
                    type: String,
                    enum: ['low', 'medium', 'high'],
                },
                description: String,
            }],
            suggestedSpecialty: {
                type: String,
                default: null,
            },
            recommendation: {
                type: String,
                default: null,
            },
            disclaimer: {
                type: String,
                default: 'This is an AI-generated analysis and should not replace professional medical advice.',
            },
        },
    },
    {
        timestamps: true,
    }
);

symptomAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SymptomAnalysis', symptomAnalysisSchema);
