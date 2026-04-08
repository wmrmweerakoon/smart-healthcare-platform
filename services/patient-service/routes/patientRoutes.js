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

// All routes require authentication and patient role
router.use(extractUser);
router.use(patientOnly);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileValidation, updateProfile);

// Report routes
router.post('/upload-report', upload.single('report'), reportValidation, uploadReport);
router.get('/reports', getReports);
router.get('/reports/:id', getReport);
router.delete('/reports/:id', deleteReport);

// Prescription routes (read-only)
router.get('/prescriptions', getPrescriptions);

module.exports = router;
