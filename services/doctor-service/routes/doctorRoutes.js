const express = require('express');
const router = express.Router();
const { extractUser, doctorOnly } = require('../middleware/auth');
const {
    profileValidation,
    availabilityValidation,
    prescriptionValidation,
} = require('../validators/doctorValidator');
const {
    getProfile,
    updateProfile,
    setAvailability,
    getAvailability,
    createPrescription,
    getPrescriptions,
    searchDoctors,
    getAllDoctors,
    getDoctorAvailability,
} = require('../controllers/doctorController');

// ─── Public routes (no auth required) ────────────────────
router.get('/search', searchDoctors);
router.get('/all', getAllDoctors);
router.get('/availability/:doctorId', getDoctorAvailability);

// ─── Protected routes (doctor role required) ─────────────
router.use(extractUser);
router.use(doctorOnly);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileValidation, updateProfile);

// Availability routes
router.post('/availability', availabilityValidation, setAvailability);
router.get('/availability', getAvailability);

// Prescription routes
router.post('/prescription', prescriptionValidation, createPrescription);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
