const mongoose = require('mongoose');

const VideoSessionSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: String,
            required: [true, 'Appointment ID is required'],
            unique: true,
        },
        roomId: {
            type: String,
            required: [true, 'Room ID is required'],
            unique: true,
        },
        doctorId: {
            type: String,
            required: [true, 'Doctor ID is required'],
            index: true,
        },
        patientId: {
            type: String,
            required: [true, 'Patient ID is required'],
            index: true,
        },
        status: {
            type: String,
            enum: ['waiting', 'active', 'ended'],
            default: 'waiting',
        },
        jitsiUrl: {
            type: String,
            required: true,
        },
        startedAt: {
            type: Date,
            default: null,
        },
        endedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('VideoSession', VideoSessionSchema);
