const { body } = require('express-validator');

// Validation rules for booking
exports.bookingValidation = [
    body('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be a valid date format'),
    body('timeSlot.startTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Start time must be in HH:MM format'),
    body('timeSlot.endTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('End time must be in HH:MM format'),
    body('type')
        .optional()
        .isIn(['in-person', 'video'])
        .withMessage('Type must be in-person or video'),
    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
];

// Validation rules for status update
exports.statusValidation = [
    body('status')
        .optional()
        .isIn(['pending', 'accepted', 'rejected', 'cancelled', 'completed'])
        .withMessage('Invalid status value'),
    body('notes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters'),
];
