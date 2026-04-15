const express = require('express');
const router = express.Router();
const {
    sendEmailNotification,
    sendSMSNotification,
    appointmentBooked,
    appointmentCompleted,
    getAllNotifications,
    getMyNotifications,
} = require('../controllers/notificationController');

// POST /send-email           — Send an email notification
router.post('/send-email', sendEmailNotification);

// POST /send-sms             — Send an SMS notification
router.post('/send-sms', sendSMSNotification);

// POST /appointment-booked   — Trigger appointment booked notification
router.post('/appointment-booked', appointmentBooked);

// POST /appointment-completed — Trigger appointment completed notification
router.post('/appointment-completed', appointmentCompleted);

// GET  /all                  — Get all notifications (admin)
router.get('/all', getAllNotifications);

// GET  /my-notifications     — Get notifications for current user
router.get('/my-notifications', getMyNotifications);

module.exports = router;
