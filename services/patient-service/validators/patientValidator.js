const { body } = require('express-validator');

// Validation rules for creating/updating patient profile
exports.profileValidation = [
    body('phone')
        .optional()
        .matches(/^\+?[\d\s-]{7,15}$/)
        .withMessage('Please provide a valid phone number'),

    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('bloodGroup')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood group'),

    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Street cannot exceed 200 characters'),

    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),

    body('address.state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('State cannot exceed 100 characters'),

    body('address.zipCode')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Zip code cannot exceed 20 characters'),

    body('address.country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country cannot exceed 100 characters'),

    body('emergencyContact.name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Emergency contact name cannot exceed 100 characters'),

    body('emergencyContact.relationship')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Relationship cannot exceed 50 characters'),

    body('emergencyContact.phone')
        .optional()
        .matches(/^\+?[\d\s-]{7,15}$/)
        .withMessage('Emergency contact phone must be a valid phone number'),

    body('allergies')
        .optional()
        .isArray()
        .withMessage('Allergies must be an array'),

    body('allergies.*')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Each allergy entry cannot exceed 100 characters'),

    body('chronicConditions')
        .optional()
        .isArray()
        .withMessage('Chronic conditions must be an array'),

    body('chronicConditions.*')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Each chronic condition entry cannot exceed 100 characters'),
];

// Validation rules for report upload metadata
exports.reportValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Report title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
];
