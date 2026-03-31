const User = require('../models/User');

// @desc    Get all users
// @route   GET /users
// @access  Private (Admin Only)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a user
// @route   DELETE /user/:id
// @access  Private (Admin Only)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify a doctor account
// @route   PUT /verify-doctor/:id
// @access  Private (Admin Only)
exports.verifyDoctor = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role !== 'doctor') {
            return res.status(400).json({ success: false, message: 'Only doctor accounts can be verified' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all appointments (Mock)
// @route   GET /appointments
// @access  Private (Admin Only)
exports.getAppointments = async (req, res, next) => {
    try {
        // Placeholder for Member 3/4's appointment service
        res.status(200).json({
            success: true,
            message: 'Appointment management belongs to Member 3/4. Returning empty list.',
            count: 0,
            data: [],
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all payments (Mock)
// @route   GET /payments
// @access  Private (Admin Only)
exports.getPayments = async (req, res, next) => {
    try {
        // Placeholder for Member 4's payment service
        res.status(200).json({
            success: true,
            message: 'Payment management belongs to Member 4. Returning empty list.',
            count: 0,
            data: [],
        });
    } catch (err) {
        next(err);
    }
};
