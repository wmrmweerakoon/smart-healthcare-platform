const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: [true, 'Patient user ID is required'],
            index: true,
        },
        doctorId: {
            type: String,
            required: [true, 'Doctor user ID is required'],
            index: true,
        },
        appointmentId: {
            type: String,
        },
        diagnosis: {
            type: String,
            required: [true, 'Diagnosis is required'],
            trim: true,
        },
        medications: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                dosage: {
                    type: String,
                    required: true,
                    trim: true,
                },
                frequency: {
                    type: String,
                    required: true,
                    trim: true,
                },
                duration: {
                    type: String,
                    trim: true,
                },
                instructions: {
                    type: String,
                    trim: true,
                },
            },
        ],
        notes: {
            type: String,
            trim: true,
            maxlength: [2000, 'Notes cannot exceed 2000 characters'],
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index for efficient doctor-based queries with sorting
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
