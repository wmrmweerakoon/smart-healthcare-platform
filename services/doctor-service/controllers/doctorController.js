const { validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');

// @desc    Get doctor profile
// @route   GET /profile
// @access  Private (Doctor only)
exports.getProfile = async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found. Please create your profile first.',
            });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create or update doctor profile
// @route   PUT /profile
// @access  Private (Doctor only)
exports.updateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const {
            name,
            email,
            phone,
            specialty,
            qualifications,
            experience,
            bio,
            consultationFee,
        } = req.body;

        const profileData = {
            userId: req.user.id,
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(specialty && { specialty }),
            ...(qualifications && { qualifications }),
            ...(experience !== undefined && { experience }),
            ...(bio && { bio }),
            ...(consultationFee !== undefined && { consultationFee }),
        };

        // Upsert — create if doesn't exist, update if it does
        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            profileData,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: doctor,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Set doctor availability
// @route   POST /availability
// @access  Private (Doctor only)
exports.setAvailability = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { availability } = req.body;

        // Validate each slot: endTime must be after startTime
        for (const slot of availability) {
            if (slot.startTime >= slot.endTime) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid time slot for ${slot.day}: end time must be after start time`,
                });
            }
        }

        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            { availability },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: doctor.availability,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get doctor's availability
// @route   GET /availability
// @access  Private (Doctor only)
exports.getAvailability = async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: doctor.availability || [],
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Issue a prescription
// @route   POST /prescription
// @access  Private (Doctor only)
exports.createPrescription = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { patientId, appointmentId, diagnosis, medications, notes } = req.body;

        const prescription = await Prescription.create({
            patientId,
            doctorId: req.user.id,
            appointmentId: appointmentId || undefined,
            diagnosis,
            medications,
            notes: notes || '',
        });

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all prescriptions issued by this doctor
// @route   GET /prescriptions
// @access  Private (Doctor only)
exports.getPrescriptions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total = await Prescription.countDocuments({ doctorId: req.user.id });
        const prescriptions = await Prescription.find({ doctorId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: prescriptions,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search doctors by specialty (public)
// @route   GET /search
// @access  Public
exports.searchDoctors = async (req, res, next) => {
    try {
        const { specialty, name } = req.query;
        const query = { isVerified: true };

        if (specialty) {
            query.specialty = { $regex: specialty, $options: 'i' };
        }

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const doctors = await Doctor.find(query)
            .select('userId name specialty qualifications experience bio consultationFee availability')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all verified doctors (public)
// @route   GET /all
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find({ isVerified: true })
            .select('userId name specialty qualifications experience bio consultationFee availability')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a specific doctor's availability (public - for booking)
// @route   GET /availability/:doctorId
// @access  Public
exports.getDoctorAvailability = async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.doctorId })
            .select('userId name specialty availability consultationFee');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        next(error);
    }
};
