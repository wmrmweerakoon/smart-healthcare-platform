const mongoose = require('mongoose');

const AvailabilitySlotSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
        },
        endTime: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
        },
    },
    { _id: false }
);

const DoctorSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            unique: true,
            index: true,
        },
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
        },
        specialty: {
            type: String,
            trim: true,
            maxlength: [100, 'Specialty cannot exceed 100 characters'],
        },
        qualifications: [
            {
                type: String,
                trim: true,
            },
        ],
        experience: {
            type: Number,
            min: [0, 'Experience cannot be negative'],
            max: [70, 'Experience seems unrealistic'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [2000, 'Bio cannot exceed 2000 characters'],
        },
        consultationFee: {
            type: Number,
            min: [0, 'Fee cannot be negative'],
        },
        availability: [AvailabilitySlotSchema],
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for specialty-based search
DoctorSchema.index({ specialty: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
