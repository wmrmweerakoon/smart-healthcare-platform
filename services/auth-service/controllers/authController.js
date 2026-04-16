const { validationResult, body } = require('express-validator');
const User = require('../models/User');

// Validation rules
exports.registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['patient', 'doctor', 'admin'])
        .withMessage('Role must be patient, doctor, or admin'),
];

exports.loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

// @desc    Get User By ID (Internal Service Use)
// @route   GET /internal/user/:id
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Register a new user
// @route   POST /register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { name, email, password, role, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Create user
        const user = await User.create({ name, email, password, role, phoneNumber: phoneNumber || '' });

        // Generate token and respond
        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate token and respond
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged-in user
// @route   GET /me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
        },
    });
};

// @desc    Admin Create User (Internal)
// @route   POST /internal/admin/create-user
exports.adminCreateUser = async (req, res, next) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            phoneNumber: phoneNumber || '',
            isVerified: true // Auto-verify if admin creates them
        });


        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: user._id, name, email, role }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update User Details (Admin/Self)
// @route   PUT /internal/admin/update-user/:id
exports.updateExistingUser = async (req, res, next) => {
    try {
        const { name, email, role, isVerified } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isVerified !== 'undefined') user.isVerified = isVerified;

        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

