const User = require('../models/User');
const axiosClient = require('../utils/axiosClient');

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

        // ─── SYNC WITH DOCTOR SERVICE ──────────────────────────
        try {
            const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:5003';
            await axiosClient.put(`${doctorServiceUrl}/verify-status/${user._id}`, {
                isVerified: true
            }, {
                headers: {
                    'X-User-Id': req.headers['x-user-id'] || 'admin-sync',
                    'X-User-Role': 'admin'
                }
            });
        } catch (syncErr) {
            console.error('Failed to sync verification with Doctor Service:', syncErr.message);
        }
        // ───────────────────────────────────────────────────────

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all appointments
// @route   GET /appointments
// @access  Private (Admin Only)
exports.getAppointments = async (req, res, next) => {
    try {
        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';
        const page = req.query.page || 1;
        const limit = req.query.limit || 20;

        const response = await axiosClient.get(`${appointmentServiceUrl}/my-appointments?page=${page}&limit=${limit}`, {
            headers: {
                'X-User-Role': 'admin',
                'X-User-Id': req.headers['x-user-id'] || 'admin'
            }
        });

        res.status(200).json(response.data);
    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        next(err);
    }
};

// @desc    Get all payments
// @route   GET /payments
// @access  Private (Admin Only)
exports.getPayments = async (req, res, next) => {
    try {
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5005';
        const page = req.query.page || 1;
        const limit = req.query.limit || 20;

        const response = await axiosClient.get(`${paymentServiceUrl}/all?page=${page}&limit=${limit}`, {
            headers: {
                'X-User-Role': 'admin',
                'X-User-Id': req.headers['x-user-id'] || 'admin'
            }
        });

        res.status(200).json(response.data);
    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        next(err);
    }
};
