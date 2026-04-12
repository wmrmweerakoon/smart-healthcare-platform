const { v4: uuidv4 } = require('uuid');
const VideoSession = require('../models/VideoSession');

const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.jit.si';

// @desc    Create a video session for an appointment
// @route   POST /create-session
// @access  Private (Doctor or Patient)
exports.createSession = async (req, res, next) => {
    try {
        const { appointmentId, doctorId, patientId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: 'Appointment ID is required',
            });
        }

        // Check if session already exists for this appointment
        const existingSession = await VideoSession.findOne({ appointmentId });
        if (existingSession) {
            return res.status(200).json({
                success: true,
                message: 'Session already exists for this appointment',
                data: existingSession,
            });
        }

        // Generate unique room ID
        const roomId = `healthcare-${uuidv4()}`;
        const jitsiUrl = `https://${JITSI_DOMAIN}/${roomId}`;

        const session = await VideoSession.create({
            appointmentId,
            roomId,
            doctorId: doctorId || req.user.id,
            patientId: patientId || '',
            status: 'waiting',
            jitsiUrl,
        });

        res.status(201).json({
            success: true,
            message: 'Video session created',
            data: session,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get session details and join URL
// @route   GET /join-session/:roomId
// @access  Private (Doctor or Patient)
exports.joinSession = async (req, res, next) => {
    try {
        const session = await VideoSession.findOne({ roomId: req.params.roomId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Video session not found',
            });
        }

        // Verify the user is part of this session
        if (
            session.doctorId !== req.user.id &&
            session.patientId !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to join this session',
            });
        }

        // Mark as active if it was waiting
        if (session.status === 'waiting') {
            session.status = 'active';
            session.startedAt = new Date();
            await session.save();
        }

        res.status(200).json({
            success: true,
            data: {
                roomId: session.roomId,
                jitsiUrl: session.jitsiUrl,
                appointmentId: session.appointmentId,
                status: session.status,
                startedAt: session.startedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get session by appointment ID
// @route   GET /session-by-appointment/:appointmentId
// @access  Private
exports.getSessionByAppointment = async (req, res, next) => {
    try {
        const session = await VideoSession.findOne({
            appointmentId: req.params.appointmentId,
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'No video session found for this appointment',
            });
        }

        res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    End a video session
// @route   PUT /end-session/:roomId
// @access  Private (Doctor or Patient)
exports.endSession = async (req, res, next) => {
    try {
        const session = await VideoSession.findOne({ roomId: req.params.roomId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Video session not found',
            });
        }

        if (
            session.doctorId !== req.user.id &&
            session.patientId !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to end this session',
            });
        }

        session.status = 'ended';
        session.endedAt = new Date();
        await session.save();

        res.status(200).json({
            success: true,
            message: 'Video session ended',
            data: session,
        });
    } catch (error) {
        next(error);
    }
};
