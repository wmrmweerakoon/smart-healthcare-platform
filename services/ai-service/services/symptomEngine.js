/**
 * Rule-based symptom analysis engine.
 * Maps symptoms to possible conditions and recommended specialties.
 * In production, this would be replaced by an actual ML/AI model or external API.
 */

const symptomDatabase = {
    // ─── Head & Neurological ─────────────────────────────
    headache: {
        conditions: [
            { condition: 'Tension Headache', probability: 'High', severity: 'low', description: 'Common headache caused by stress, fatigue, or muscle tension.' },
            { condition: 'Migraine', probability: 'Medium', severity: 'medium', description: 'A recurring headache with throbbing pain, often on one side.' },
            { condition: 'Sinusitis', probability: 'Low', severity: 'low', description: 'Inflammation of the sinus cavities causing pressure and headache.' },
        ],
        specialty: 'Neurologist',
    },
    dizziness: {
        conditions: [
            { condition: 'Vertigo (BPPV)', probability: 'Medium', severity: 'medium', description: 'Inner ear issue causing spinning sensation.' },
            { condition: 'Low Blood Pressure', probability: 'Medium', severity: 'low', description: 'Blood pressure drop on standing causing lightheadedness.' },
            { condition: 'Anemia', probability: 'Low', severity: 'medium', description: 'Low red blood cell count reducing oxygen delivery.' },
        ],
        specialty: 'Neurologist',
    },

    // ─── Respiratory ─────────────────────────────────────
    cough: {
        conditions: [
            { condition: 'Common Cold', probability: 'High', severity: 'low', description: 'Viral upper respiratory infection.' },
            { condition: 'Bronchitis', probability: 'Medium', severity: 'medium', description: 'Inflammation of the bronchial tubes.' },
            { condition: 'Asthma', probability: 'Low', severity: 'medium', description: 'Chronic airway inflammation causing breathing difficulty.' },
        ],
        specialty: 'Pulmonologist',
    },
    'shortness of breath': {
        conditions: [
            { condition: 'Asthma', probability: 'Medium', severity: 'medium', description: 'Chronic airway disease with episodic breathing difficulty.' },
            { condition: 'Pneumonia', probability: 'Medium', severity: 'high', description: 'Lung infection causing inflammation and fluid in air sacs.' },
            { condition: 'Heart Failure', probability: 'Low', severity: 'high', description: 'Heart unable to pump blood effectively.' },
        ],
        specialty: 'Pulmonologist',
    },
    'sore throat': {
        conditions: [
            { condition: 'Pharyngitis', probability: 'High', severity: 'low', description: 'Inflammation of the throat, often viral.' },
            { condition: 'Strep Throat', probability: 'Medium', severity: 'medium', description: 'Bacterial throat infection requiring antibiotics.' },
            { condition: 'Tonsillitis', probability: 'Low', severity: 'medium', description: 'Inflammation of the tonsils.' },
        ],
        specialty: 'ENT Specialist',
    },

    // ─── Cardiovascular ──────────────────────────────────
    'chest pain': {
        conditions: [
            { condition: 'Gastroesophageal Reflux (GERD)', probability: 'Medium', severity: 'low', description: 'Acid reflux causing chest discomfort.' },
            { condition: 'Angina', probability: 'Medium', severity: 'high', description: 'Chest pain from reduced blood flow to the heart.' },
            { condition: 'Myocardial Infarction', probability: 'Low', severity: 'high', description: 'Heart attack — seek emergency care immediately.' },
        ],
        specialty: 'Cardiologist',
    },
    palpitations: {
        conditions: [
            { condition: 'Anxiety', probability: 'High', severity: 'low', description: 'Stress or panic causing rapid heartbeat awareness.' },
            { condition: 'Arrhythmia', probability: 'Medium', severity: 'medium', description: 'Irregular heart rhythm requiring evaluation.' },
            { condition: 'Hyperthyroidism', probability: 'Low', severity: 'medium', description: 'Overactive thyroid increasing heart rate.' },
        ],
        specialty: 'Cardiologist',
    },

    // ─── Gastrointestinal ────────────────────────────────
    'stomach pain': {
        conditions: [
            { condition: 'Gastritis', probability: 'High', severity: 'low', description: 'Stomach lining inflammation.' },
            { condition: 'Peptic Ulcer', probability: 'Medium', severity: 'medium', description: 'Open sore in stomach or duodenal lining.' },
            { condition: 'Appendicitis', probability: 'Low', severity: 'high', description: 'Appendix inflammation — may require surgery.' },
        ],
        specialty: 'Gastroenterologist',
    },
    nausea: {
        conditions: [
            { condition: 'Food Poisoning', probability: 'High', severity: 'low', description: 'Illness from contaminated food or water.' },
            { condition: 'Gastroenteritis', probability: 'Medium', severity: 'low', description: 'Viral or bacterial stomach infection.' },
            { condition: 'Pregnancy', probability: 'Low', severity: 'low', description: 'Morning sickness in early pregnancy.' },
        ],
        specialty: 'Gastroenterologist',
    },
    diarrhea: {
        conditions: [
            { condition: 'Gastroenteritis', probability: 'High', severity: 'low', description: 'Stomach flu causing loose stools.' },
            { condition: 'Irritable Bowel Syndrome', probability: 'Medium', severity: 'low', description: 'Chronic digestive disorder.' },
            { condition: 'Food Intolerance', probability: 'Medium', severity: 'low', description: 'Difficulty digesting certain foods (e.g., lactose).' },
        ],
        specialty: 'Gastroenterologist',
    },

    // ─── Musculoskeletal ─────────────────────────────────
    'back pain': {
        conditions: [
            { condition: 'Muscle Strain', probability: 'High', severity: 'low', description: 'Overuse or injury to back muscles.' },
            { condition: 'Herniated Disc', probability: 'Medium', severity: 'medium', description: 'Disc bulge pressing on spinal nerves.' },
            { condition: 'Kidney Stone', probability: 'Low', severity: 'high', description: 'Stone in urinary tract causing sharp pain.' },
        ],
        specialty: 'Orthopedic Surgeon',
    },
    'joint pain': {
        conditions: [
            { condition: 'Osteoarthritis', probability: 'Medium', severity: 'medium', description: 'Degenerative joint disease from wear and tear.' },
            { condition: 'Rheumatoid Arthritis', probability: 'Low', severity: 'medium', description: 'Autoimmune disorder affecting joints.' },
            { condition: 'Gout', probability: 'Low', severity: 'medium', description: 'Uric acid crystal buildup in joints.' },
        ],
        specialty: 'Rheumatologist',
    },

    // ─── Dermatological ──────────────────────────────────
    rash: {
        conditions: [
            { condition: 'Contact Dermatitis', probability: 'High', severity: 'low', description: 'Allergic skin reaction to an irritant.' },
            { condition: 'Eczema', probability: 'Medium', severity: 'low', description: 'Chronic inflammatory skin condition.' },
            { condition: 'Psoriasis', probability: 'Low', severity: 'medium', description: 'Autoimmune skin condition with scaly patches.' },
        ],
        specialty: 'Dermatologist',
    },

    // ─── General / Systemic ──────────────────────────────
    fever: {
        conditions: [
            { condition: 'Viral Infection', probability: 'High', severity: 'low', description: 'Common viral illness triggering fever response.' },
            { condition: 'Bacterial Infection', probability: 'Medium', severity: 'medium', description: 'Bacterial cause requiring possible antibiotic therapy.' },
            { condition: 'COVID-19', probability: 'Low', severity: 'medium', description: 'Coronavirus infection — testing recommended.' },
        ],
        specialty: 'General Practitioner',
    },
    fatigue: {
        conditions: [
            { condition: 'Sleep Deficit', probability: 'High', severity: 'low', description: 'Insufficient or poor quality sleep.' },
            { condition: 'Anemia', probability: 'Medium', severity: 'medium', description: 'Low hemoglobin reducing oxygen transport.' },
            { condition: 'Hypothyroidism', probability: 'Low', severity: 'medium', description: 'Underactive thyroid slowing metabolism.' },
        ],
        specialty: 'General Practitioner',
    },

    // ─── Eye ─────────────────────────────────────────────
    'blurred vision': {
        conditions: [
            { condition: 'Refractive Error', probability: 'High', severity: 'low', description: 'Nearsightedness, farsightedness, or astigmatism.' },
            { condition: 'Dry Eye Syndrome', probability: 'Medium', severity: 'low', description: 'Insufficient tear production.' },
            { condition: 'Diabetic Retinopathy', probability: 'Low', severity: 'high', description: 'Diabetes-related damage to retinal blood vessels.' },
        ],
        specialty: 'Ophthalmologist',
    },

    // ─── Mental Health ───────────────────────────────────
    anxiety: {
        conditions: [
            { condition: 'Generalized Anxiety Disorder', probability: 'Medium', severity: 'medium', description: 'Persistent excessive worry affecting daily life.' },
            { condition: 'Panic Disorder', probability: 'Low', severity: 'medium', description: 'Recurrent unexpected panic attacks.' },
            { condition: 'Hyperthyroidism', probability: 'Low', severity: 'medium', description: 'Overactive thyroid mimicking anxiety symptoms.' },
        ],
        specialty: 'Psychiatrist',
    },
    insomnia: {
        conditions: [
            { condition: 'Stress-related Insomnia', probability: 'High', severity: 'low', description: 'Difficulty sleeping due to stress or anxiety.' },
            { condition: 'Sleep Apnea', probability: 'Medium', severity: 'medium', description: 'Breathing interruptions during sleep.' },
            { condition: 'Depression', probability: 'Low', severity: 'medium', description: 'Mood disorder affecting sleep patterns.' },
        ],
        specialty: 'Psychiatrist',
    },

    // ─── Systemic & Others ─────────────────────────────
    chills: {
        conditions: [
            { condition: 'Fever', probability: 'High', severity: 'low', description: 'Body temperature spike causing shivering.' },
            { condition: 'Malaria', probability: 'Low', severity: 'medium', description: 'Mosquito-borne illness causing intense chills and fever.' },
            { condition: 'Influenza', probability: 'Medium', severity: 'medium', description: 'Viral infection with systemic symptoms.' },
        ],
        specialty: 'General Practitioner',
    },
    itching: {
        conditions: [
            { condition: 'Allergy', probability: 'High', severity: 'low', description: 'Immune response to an allergen.' },
            { condition: 'Contact Dermatitis', probability: 'Medium', severity: 'low', description: 'Skin irritation from direct contact.' },
            { condition: 'Hives (Urticaria)', probability: 'Medium', severity: 'low', description: 'Red, itchy welts often from an allergic reaction.' },
        ],
        specialty: 'Dermatologist',
    },
    'muscle aches': {
        conditions: [
            { condition: 'Physical Overexertion', probability: 'High', severity: 'low', description: 'Soreness from muscle use or minor strain.' },
            { condition: 'Influenza', probability: 'High', severity: 'medium', description: 'Flu often causes body-wide muscle pain.' },
            { condition: 'Fibromyalgia', probability: 'Low', severity: 'medium', description: 'Chronic condition causing widespread musculoskeletal pain.' },
        ],
        specialty: 'Rheumatologist',
    },
    'weight loss': {
        conditions: [
            { condition: 'Hyperthyroidism', probability: 'Medium', severity: 'medium', description: 'Overactive thyroid increasing calorie burn.' },
            { condition: 'Diabetes mellitus', probability: 'Medium', severity: 'medium', description: 'High blood sugar causing weight loss despite eating.' },
            { condition: 'Stress/Anxiety', probability: 'High', severity: 'low', description: 'Psychological factors affecting appetite.' },
        ],
        specialty: 'Endocrinologist',
    },
    thirst: {
        conditions: [
            { condition: 'Dehydration', probability: 'High', severity: 'low', description: 'Insufficient fluid intake or loss.' },
            { condition: 'Diabetes mellitus', probability: 'Medium', severity: 'medium', description: 'Excessive thirst (polydipsia) is a cardinal sign of diabetes.' },
        ],
        specialty: 'Endocrinologist',
    },
    sneezing: {
        conditions: [
            { condition: 'Allergic Rhinitis', probability: 'High', severity: 'low', description: 'Hay fever or seasonal allergies.' },
            { condition: 'Common Cold', probability: 'Medium', severity: 'low', description: 'Viral infection of the upper respiratory tract.' },
        ],
        specialty: 'ENT Specialist',
    },
};

/**
 * Analyze an array of symptom strings.
 * Returns aggregated conditions sorted by severity, plus a recommended specialty.
 */
const analyzeSymptoms = (symptoms, age, gender) => {
    const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());
    const conditionsMap = new Map();
    const specialtyCounts = {};

    for (const symptom of normalizedSymptoms) {
        const entry = symptomDatabase[symptom];
        if (!entry) continue;

        // Count specialty occurrences
        specialtyCounts[entry.specialty] = (specialtyCounts[entry.specialty] || 0) + 1;

        for (const cond of entry.conditions) {
            const key = cond.condition;
            if (!conditionsMap.has(key)) {
                conditionsMap.set(key, { ...cond, matchCount: 1 });
            } else {
                conditionsMap.get(key).matchCount++;
                // Upgrade probability if matched by multiple symptoms
                const existing = conditionsMap.get(key);
                if (existing.matchCount >= 3) existing.probability = 'High';
                else if (existing.matchCount >= 2 && existing.probability === 'Low') existing.probability = 'Medium';
            }
        }
    }

    // Sort: high severity first, then by probability
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const probOrder = { High: 3, Medium: 2, Low: 1 };
    const possibleConditions = Array.from(conditionsMap.values())
        .sort((a, b) => {
            const sevDiff = severityOrder[b.severity] - severityOrder[a.severity];
            if (sevDiff !== 0) return sevDiff;
            return probOrder[b.probability] - probOrder[a.probability];
        })
        .slice(0, 5) // Top 5
        .map(({ matchCount, ...rest }) => rest);

    // Determine top specialty
    const suggestedSpecialty = Object.entries(specialtyCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Practitioner';

    // Build recommendation
    let recommendation = 'Based on your symptoms, we recommend consulting a ' + suggestedSpecialty + '.';
    const hasHighSeverity = possibleConditions.some((c) => c.severity === 'high');
    if (hasHighSeverity) {
        recommendation = '⚠️ Some possible conditions have HIGH severity. Please seek medical attention promptly. ' + recommendation;
    }

    if (possibleConditions.length === 0) {
        return {
            possibleConditions: [
                {
                    condition: 'Unrecognized symptoms',
                    probability: 'N/A',
                    severity: 'low',
                    description: 'The provided symptoms were not found in our database. Please consult a General Practitioner.',
                },
            ],
            suggestedSpecialty: 'General Practitioner',
            recommendation: 'We could not match your symptoms. Please consult a General Practitioner for a proper diagnosis.',
            disclaimer: 'This is an AI-generated analysis and should not replace professional medical advice.',
        };
    }

    return {
        possibleConditions,
        suggestedSpecialty,
        recommendation,
        disclaimer: 'This is an AI-generated analysis and should not replace professional medical advice. Always consult a qualified healthcare professional.',
    };
};

module.exports = { analyzeSymptoms, symptomDatabase };
