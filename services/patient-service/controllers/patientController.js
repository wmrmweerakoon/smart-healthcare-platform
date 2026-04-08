const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Report = require('../models/Report');
const Prescription = require('../models/Prescription');
const fs = require('fs');
const path = require('path');

// @desc    Get patient profile
// @route   GET /profile
// @access  Private (Patient only)
exports.getProfile = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found. Please create your profile first.',
            });
        }

        res.status(200).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create or update patient profile
// @route   PUT /profile
// @access  Private (Patient only)
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
            dateOfBirth,
            gender,
            bloodGroup,
            address,
            emergencyContact,
            allergies,
            chronicConditions,
        } = req.body;

        const profileData = {
            userId: req.user.id,
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(gender && { gender }),
            ...(bloodGroup && { bloodGroup }),
            ...(address && { address }),
            ...(emergencyContact && { emergencyContact }),
            ...(allergies && { allergies }),
            ...(chronicConditions && { chronicConditions }),
        };

        // Upsert — create if doesn't exist, update if it does
        const patient = await Patient.findOneAndUpdate(
            { userId: req.user.id },
            profileData,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload a medical report (PDF/image)
// @route   POST /upload-report
// @access  Private (Patient only)
exports.uploadReport = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file (PDF, JPEG, or PNG)',
            });
        }

        // Validate title via express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Remove uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const report = await Report.create({
            patientId: req.user.id,
            title: req.body.title,
            description: req.body.description || '',
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
        });

        res.status(201).json({
            success: true,
            message: 'Report uploaded successfully',
            data: report,
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error('File cleanup error:', cleanupErr.message);
            }
        }
        next(error);
    }
};

// @desc    Get all reports for the patient (paginated)
// @route   GET /reports
// @access  Private (Patient only)
exports.getReports = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total = await Report.countDocuments({ patientId: req.user.id });
        const reports = await Report.find({ patientId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: reports.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: reports,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single report by ID
// @route   GET /reports/:id
// @access  Private (Patient only)
exports.getReport = async (req, res, next) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            patientId: req.user.id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found',
            });
        }

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a report
// @route   DELETE /reports/:id
// @access  Private (Patient only)
exports.deleteReport = async (req, res, next) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            patientId: req.user.id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found',
            });
        }

        // Delete the physical file
        const filePath = path.join(__dirname, '..', report.fileUrl);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileErr) {
            console.error('File deletion error:', fileErr.message);
        }

        await Report.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Report deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get prescriptions for the patient (paginated)
// @route   GET /prescriptions
// @access  Private (Patient only)
exports.getPrescriptions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total = await Prescription.countDocuments({ patientId: req.user.id });
        const prescriptions = await Prescription.find({ patientId: req.user.id })
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
