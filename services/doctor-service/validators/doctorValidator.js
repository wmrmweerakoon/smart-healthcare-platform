const { body } = require('express-validator');

// Validation rules for profile update
exports.profileValidation = [
    body('phone')
        .optional()
        .matches(/^\+?[\d\s-]{7,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('specialty')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Specialty cannot exceed 100 characters'),
    body('experience')
        .optional()
        .isInt({ min: 0, max: 70 })
        .withMessage('Experience must be between 0 and 70 years'),
    body('bio')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Bio cannot exceed 2000 characters'),
    body('consultationFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be a positive number'),
    body('qualifications')
        .optional()
        .isArray()
        .withMessage('Qualifications must be an array'),
];

// Validation rules for availability
exports.availabilityValidation = [
    body('availability')
        .isArray({ min: 1 })
        .withMessage('Availability must be a non-empty array'),
    body('availability.*.day')
        .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        .withMessage('Day must be a valid weekday'),
    body('availability.*.startTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Start time must be in HH:MM format'),
    body('availability.*.endTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('End time must be in HH:MM format'),
];

// Validation rules for prescription
exports.prescriptionValidation = [
    body('patientId')
        .notEmpty()
        .withMessage('Patient ID is required'),
    body('diagnosis')
        .notEmpty()
        .withMessage('Diagnosis is required')
        .isLength({ max: 500 })
        .withMessage('Diagnosis cannot exceed 500 characters'),
    body('medications')
        .isArray({ min: 1 })
        .withMessage('At least one medication is required'),
    body('medications.*.name')
        .notEmpty()
        .withMessage('Medication name is required'),
    body('medications.*.dosage')
        .notEmpty()
        .withMessage('Medication dosage is required'),
    body('medications.*.frequency')
        .notEmpty()
        .withMessage('Medication frequency is required'),
    body('notes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters'),
];
