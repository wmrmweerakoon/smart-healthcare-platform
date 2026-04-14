const express = require('express');
const router = express.Router();
const { extractUser, patientOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    profileValidation,
    reportValidation,
} = require('../validators/patientValidator');
const {
    getProfile,
    updateProfile,
    uploadReport,
    getReports,
    getReport,
    deleteReport,
    getPrescriptions,
} = require('../controllers/patientController');

// All routes require authentication
router.use(extractUser);

// Profile routes
router.get('/profile', patientOnly, getProfile);
router.put('/profile', patientOnly, profileValidation, updateProfile);

// Report routes
router.post('/upload-report', patientOnly, upload.single('report'), reportValidation, uploadReport);
router.get('/reports', patientOnly, getReports);
router.get('/reports/:id', patientOnly, getReport);
router.delete('/reports/:id', patientOnly, deleteReport);

// Prescription routes (read-only)
router.get('/prescriptions', patientOnly, getPrescriptions);


module.exports = router;
