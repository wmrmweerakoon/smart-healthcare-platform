const mongoose = require('mongoose');

// Read-only schema — prescriptions are created by the Doctor Service
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
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
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

// Index for efficient patient-based queries with sorting
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
