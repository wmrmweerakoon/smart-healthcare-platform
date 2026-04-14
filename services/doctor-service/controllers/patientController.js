const axios = require('axios');
const Prescription = require('../models/Prescription');

// Internal service URLs (Docker network)
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';
const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://patient-service:5002';

// @desc    Get list of patients seen by this doctor
// @route   GET /patients
// @access  Private (Doctor only)
exports.getMyPatients = async (req, res, next) => {
    try {
        // 1. Fetch appointments for this doctor from Appointment Service
        // We use internal communication
        const appointmentsRes = await axios.get(`${APPOINTMENT_SERVICE_URL}/my-appointments`, {
            headers: {
                'x-user-id': req.user.id,
                'x-user-role': req.user.role
            }
        });

        const appointments = appointmentsRes.data.data || [];
        
        // 2. Extract unique patient IDs
        const patientDataMap = new Map();
        appointments.forEach(apt => {
            if (!patientDataMap.has(apt.patientId)) {
                patientDataMap.set(apt.patientId, {
                    patientId: apt.patientId,
                    patientName: apt.patientName,
                    lastAppointment: apt.date,
                    status: apt.status
                });
            }
        });

        const patients = Array.from(patientDataMap.values());

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patients from mapping services'
        });
    }
};

// @desc    Get a specific patient's reports (proxy to Patient Service)
// @route   GET /patients/:patientId/reports
// @access  Private (Doctor only)
exports.getPatientReports = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        // In a real scenario, we'd verify if this doctor is allowed to see this patient's reports
        // (i.e. if an appointment exists)
        
        const reportsRes = await axios.get(`${PATIENT_SERVICE_URL}/reports`, {
            headers: {
                'x-user-id': patientId, // Act as the patient to the patient-service
                'x-user-role': 'patient' // Or we updated patient-service to allow doctors
            }
        });

        res.status(200).json({
            success: true,
            data: reportsRes.data.data
        });
    } catch (error) {
        next(error);
    }
};
