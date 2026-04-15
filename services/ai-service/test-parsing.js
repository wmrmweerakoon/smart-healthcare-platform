const geminiService = require('./services/geminiService');

// Mock data
const symptoms = ['fever', 'cough'];
const age = 30;
const gender = 'male';

console.log('--- Testing JSON Parsing Logic ---');

const mockResponses = [
    // Standard JSON
    '{"possibleConditions": [{"condition": "Flu", "probability": "High", "severity": "low", "description": "Viral infection"}], "suggestedSpecialty": "GP", "recommendation": "Rest", "disclaimer": "Not medical advice"}',
    // Markdown JSON
    '```json\n{"possibleConditions": [{"condition": "Cold", "probability": "Medium", "severity": "low", "description": "Common cold"}], "suggestedSpecialty": "GP", "recommendation": "Fluids", "disclaimer": "Not medical advice"}\n```',
    // Text with JSON inside
    'Based on the symptoms, here is the result: {"possibleConditions": [{"condition": "Allergy", "probability": "Low", "severity": "low", "description": "Allergic reaction"}], "suggestedSpecialty": "Allergist", "recommendation": "Avoid triggers", "disclaimer": "Not medical advice"}'
];

mockResponses.forEach((text, i) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`Test Case ${i + 1}: SUCCESS`);
            console.log('Condition:', parsed.possibleConditions[0].condition);
        } else {
            console.log(`Test Case ${i + 1}: FAILED (No match)`);
        }
    } catch (e) {
        console.log(`Test Case ${i + 1}: FAILED (Parse error: ${e.message})`);
    }
});
