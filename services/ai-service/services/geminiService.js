const { GoogleGenerativeAI } = require('@google/generative-ai');


/**
 * Interface for Google Gemini AI
 */
class GeminiService {
    constructor() {
        this.apiKey = process.env.GOOGLE_AI_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    /**
     * Analyze symptoms using Gemini AI
     * @param {string[]} symptoms 
     * @param {number|null} age 
     * @param {string|null} gender 
     */
    async analyzeSymptomRealAI(symptoms, age, gender) {
        if (!this.apiKey) {
            throw new Error('Google AI Key not configured');
        }

        const prompt = `
            You are a medical AI assistant for a Smart Healthcare Platform.
            Analyze the following symptoms for a ${age || 'unknown age'} year old ${gender || 'unspecified gender'} patient:
            Symptoms: ${symptoms.join(', ')}

            Provide a structured JSON response EXACTLY in the following format:
            {
                "possibleConditions": [
                    {
                        "condition": "Condition Name",
                        "probability": "High/Medium/Low",
                        "severity": "high/medium/low",
                        "description": "Short description of the condition"
                    }
                ],
                "suggestedSpecialty": "Name of medical specialist (e.g. Cardiologist, Neurologist)",
                "recommendation": "General advice and next steps",
                "disclaimer": "Medical disclaimer"
            }

            Rules:
            1. Return ONLY the JSON object.
            2. Be professional and accurate.
            3. Prioritize high-severity conditions if applicable.
            4. Keep descriptions concise.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from response (handling potential markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('AI returned invalid format');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Gemini AI Error:', error.message);
            throw error;
        }
    }
}

module.exports = new GeminiService();
