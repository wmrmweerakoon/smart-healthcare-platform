const express = require('express');
const router = express.Router();
const { extractUser, roleGuard } = require('../middleware/auth');
const {
    bookingValidation,
    statusValidation,
    updateValidation,
} = require('../validators/appointmentValidator');
const {
    bookAppointment,
    getMyAppointments,
    cancelAppointment,
    acceptAppointment,
    rejectAppointment,
    updateStatus,
    getAppointment,
    updatePaymentStatus,
    updateAppointment,
    getAnalytics,
} = require('../controllers/appointmentController');

// Internal routes (no auth)
router.put('/internal/payment-status/:id', updatePaymentStatus);

// Analytics (Internal/Admin)
router.get('/analytics', getAnalytics);

// All routes require authentication

router.use(extractUser);

// Patient books an appointment
router.post('/book', roleGuard('patient', 'admin'), bookingValidation, bookAppointment);

// Reschedule an appointment
router.put('/:id', updateValidation, updateAppointment);


// Get appointments for current user (works for both patient and doctor)
router.get('/my-appointments', getMyAppointments);

// Get a single appointment
router.get('/:id', getAppointment);

// Cancel an appointment (patient or doctor)
router.put('/cancel/:id', cancelAppointment);

// Doctor-only actions
router.put('/accept/:id', roleGuard('doctor', 'admin'), acceptAppointment);
router.put('/reject/:id', roleGuard('doctor', 'admin'), rejectAppointment);
router.put('/status/:id', roleGuard('doctor', 'admin'), statusValidation, updateStatus);

module.exports = router;
