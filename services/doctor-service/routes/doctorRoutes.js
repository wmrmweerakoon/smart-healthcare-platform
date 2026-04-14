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
    getPatientPrescriptions, // Added for patient access
    searchDoctors,
    getAllDoctors,
    getDoctorAvailability,
    syncVerificationStatus,
} = require('../controllers/doctorController');

// ─── Public routes (no auth required) ────────────────────
router.get('/search', searchDoctors);
router.get('/all', getAllDoctors);
router.get('/availability/:doctorId', getDoctorAvailability);

// ─── Protected routes (any authenticated user) ───────────
router.use(extractUser);
router.get('/my-prescriptions', getPatientPrescriptions); // Accessible to patients

// ─── Restricted routes (doctor role required) ───────────
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

// Patient management routes
const { getMyPatients, getPatientReports } = require('../controllers/patientController');
router.get('/patients', getMyPatients);
router.get('/patients/:patientId/reports', getPatientReports);

// Admin-only synchronization routes
router.put('/verify-status/:userId', syncVerificationStatus);


module.exports = router;
