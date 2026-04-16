const express = require('express');
const router = express.Router();
const {
    sendEmailNotification,
    sendSMSNotification,
    appointmentBooked,
    appointmentCompleted,
    doctorAppointmentReceived,
    doctorAppointmentCancelled,
    patientAppointmentStatusUpdated,
    getAllNotifications,
    getMyNotifications,
    markAsRead,
} = require('../controllers/notificationController');

// POST /send-email           — Send an email notification
router.post('/send-email', sendEmailNotification);

// POST /send-sms             — Send an SMS notification
router.post('/send-sms', sendSMSNotification);

// POST /appointment-booked   — Trigger appointment booked notification
router.post('/appointment-booked', appointmentBooked);

// POST /appointment-completed — Trigger appointment completed notification
router.post('/appointment-completed', appointmentCompleted);

// POST /doctor-appointment-received — Trigger notification to doctor
router.post('/doctor-appointment-received', doctorAppointmentReceived);

// POST /doctor-appointment-cancelled — Trigger notification to doctor
router.post('/doctor-appointment-cancelled', doctorAppointmentCancelled);

// POST /patient-appointment-status-updated — Trigger notification to patient
router.post('/patient-appointment-status-updated', patientAppointmentStatusUpdated);

// GET  /all                  — Get all notifications (admin)
router.get('/all', getAllNotifications);

// GET  /my-notifications     — Get notifications for current user
router.get('/my-notifications', getMyNotifications);

// PUT  /read/:id             — Mark notification as read
router.put('/read/:id', markAsRead);

module.exports = router;
