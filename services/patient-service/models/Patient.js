const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
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
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            zipCode: { type: String, trim: true },
            country: { type: String, trim: true },
        },
        emergencyContact: {
            name: { type: String, trim: true },
            relationship: { type: String, trim: true },
            phone: { type: String, trim: true },
        },
        allergies: [
            {
                type: String,
                trim: true,
            },
        ],
        chronicConditions: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
