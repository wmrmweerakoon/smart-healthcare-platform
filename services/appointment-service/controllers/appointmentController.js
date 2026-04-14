const axios = require('axios');
const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:5003';

// @desc    Book an appointment
// @route   POST /book
// @access  Private (Patient)
exports.bookAppointment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
 
        const { doctorId, doctorName, date, timeSlot, type, reason } = req.body;

        // NEW: Verify Doctor Availability from Doctor Service
        try {
            const doctorAvailabilityRes = await axios.get(`${DOCTOR_SERVICE_URL}/availability/${doctorId}`);
            const doctor = doctorAvailabilityRes.data.data;

            if (!doctor || !doctor.availability || doctor.availability.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor has not set any availability yet.',
                });
            }

            // Check if requested date matches a day the doctor is available
            const requestedDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));
            const daySlots = doctor.availability.filter(slot => slot.day === requestedDay);

            if (daySlots.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Doctor is not available on ${requestedDay}s.`,
                });
            }

            // Check if requested time is within at least one of the doctor's slots for that day
            const isWithinSlot = daySlots.some(slot => 
                timeSlot.startTime >= slot.startTime && 
                timeSlot.endTime <= slot.endTime
            );

            if (!isWithinSlot) {
                return res.status(400).json({
                    success: false,
                    message: `Requested time ${timeSlot.startTime}-${timeSlot.endTime} is outside the doctor's available hours on ${requestedDay}.`,
                });
            }
        } catch (doctorErr) {
            console.error('Failed to verify doctor availability:', doctorErr.message);
            // If the service is down, we might want to fail or proceed with caution. 
            // For now, let's require validation.
            return res.status(503).json({
                success: false,
                message: 'Could not verify doctor availability. The doctor service might be offline.',
            });
        }


        // Validate date is in the future
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book an appointment in the past',
            });
        }

        // Validate time slot
        if (timeSlot.startTime >= timeSlot.endTime) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time',
            });
        }

        // Check for double booking — same doctor, same date, overlapping time
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'accepted'] },
            $or: [
                {
                    'timeSlot.startTime': { $lt: timeSlot.endTime },
                    'timeSlot.endTime': { $gt: timeSlot.startTime },
                },
            ],
        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: 'This time slot is already booked. Please choose a different time.',
            });
        }

        // Check if patient already has an appointment at the same time
        const patientConflict = await Appointment.findOne({
            patientId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'accepted'] },
            $or: [
                {
                    'timeSlot.startTime': { $lt: timeSlot.endTime },
                    'timeSlot.endTime': { $gt: timeSlot.startTime },
                },
            ],
        });

        if (patientConflict) {
            return res.status(409).json({
                success: false,
                message: 'You already have an appointment at this time.',
            });
        }

        const appointment = await Appointment.create({
            patientId: req.user.id,
            patientName: req.body.patientName || '',
            doctorId,
            doctorName: doctorName || '',
            date: appointmentDate,
            timeSlot,
            type: type || 'in-person',
            reason: reason || '',
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my appointments (patient or doctor)
// @route   GET /my-appointments
// @access  Private
exports.getMyAppointments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const { status, upcoming } = req.query;

        // Build query based on user role
        const query = {};
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'doctor') {
            query.doctorId = req.user.id;
        } else if (req.user.role === 'admin') {
            // Admin sees all — no filter
        }

        // Optional status filter
        if (status) {
            query.status = status;
        }

        // Optional upcoming filter (only future appointments)
        if (upcoming === 'true') {
            query.date = { $gte: new Date() };
        }

        const total = await Appointment.countDocuments(query);
        const appointments = await Appointment.find(query)
            .sort({ date: -1, 'timeSlot.startTime': -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: appointments.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel an appointment
// @route   PUT /cancel/:id
// @access  Private (Patient or Doctor)
exports.cancelAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Verify ownership
        if (
            appointment.patientId !== req.user.id &&
            appointment.doctorId !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment',
            });
        }

        // Can only cancel pending or accepted appointments
        if (!['pending', 'accepted'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an appointment with status '${appointment.status}'`,
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept an appointment
// @route   PUT /accept/:id
// @access  Private (Doctor only)
exports.acceptAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Only the assigned doctor can accept
        if (appointment.doctorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to accept this appointment',
            });
        }

        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept an appointment with status '${appointment.status}'`,
            });
        }

        appointment.status = 'accepted';
        if (req.body.notes) {
            appointment.notes = req.body.notes;
        }
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment accepted',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject an appointment
// @route   PUT /reject/:id
// @access  Private (Doctor only)
exports.rejectAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        if (appointment.doctorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this appointment',
            });
        }

        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject an appointment with status '${appointment.status}'`,
            });
        }

        appointment.status = 'rejected';
        if (req.body.notes) {
            appointment.notes = req.body.notes;
        }
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment rejected',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update appointment status (e.g., mark as completed)
// @route   PUT /status/:id
// @access  Private (Doctor only)
exports.updateStatus = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        if (appointment.doctorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment',
            });
        }

        // Enforce valid status transitions
        const validTransitions = {
            pending: ['accepted', 'rejected', 'cancelled'],
            accepted: ['completed', 'cancelled'],
            rejected: [],
            cancelled: [],
            completed: [],
        };

        const { status, notes } = req.body;

        if (status && !validTransitions[appointment.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from '${appointment.status}' to '${status}'`,
            });
        }

        if (status) appointment.status = status;
        if (notes) appointment.notes = notes;
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment status updated',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single appointment by ID
// @route   GET /:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Verify the user is either the patient, doctor, or admin
        if (
            appointment.patientId !== req.user.id &&
            appointment.doctorId !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment',
            });
        }

        res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};
