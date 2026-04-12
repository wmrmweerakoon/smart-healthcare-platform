const express = require('express');
const router = express.Router();
const { extractUser } = require('../middleware/auth');
const {
    createSession,
    joinSession,
    getSessionByAppointment,
    endSession,
} = require('../controllers/videoController');

// All routes require authentication
router.use(extractUser);

// Create a video session
router.post('/create-session', createSession);

// Join a video session
router.get('/join-session/:roomId', joinSession);

// Get session by appointment ID
router.get('/session-by-appointment/:appointmentId', getSessionByAppointment);

// End a video session
router.put('/end-session/:roomId', endSession);

module.exports = router;
