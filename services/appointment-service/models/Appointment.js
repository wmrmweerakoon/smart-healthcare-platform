const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: [true, 'Patient ID is required'],
            index: true,
        },
        doctorId: {
            type: String,
            required: [true, 'Doctor ID is required'],
            index: true,
        },
        patientName: {
            type: String,
            trim: true,
        },
        doctorName: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Appointment date is required'],
        },
        timeSlot: {
            startTime: {
                type: String,
                required: [true, 'Start time is required'],
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
            },
            endTime: {
                type: String,
                required: [true, 'End time is required'],
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
            },
        },
        type: {
            type: String,
            enum: ['in-person', 'video'],
            default: 'in-person',
        },
        reason: {
            type: String,
            trim: true,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
            default: 'pending',
        },
        videoSessionId: {
            type: String,
            default: null,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [2000, 'Notes cannot exceed 2000 characters'],
        },
    },
    { timestamps: true }
);

// Compound index to prevent double booking for same doctor at same time
AppointmentSchema.index(
    { doctorId: 1, date: 1, 'timeSlot.startTime': 1 },
    { unique: false }
);

// Index for efficient date-based queries
AppointmentSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
