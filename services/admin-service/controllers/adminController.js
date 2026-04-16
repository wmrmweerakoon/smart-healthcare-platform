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

// @desc    Get platform-wide dashboard stats
// @route   GET /stats
// @access  Private (Admin Only)
exports.getDashboardStats = async (req, res, next) => {
    try {
        // 1. User stats (Direct DB access)
        const totalUsers = await User.countDocuments();
        const patientCount = await User.countDocuments({ role: 'patient' });
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const adminCount = await User.countDocuments({ role: 'admin' });
        const verifiedDoctorCount = await User.countDocuments({ role: 'doctor', isVerified: true });

        // 2. Fetch stats from other services via internal API
        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5005';

        let totalAppointments = 0;
        let totalRevenue = 0;
        let recentPayments = [];

        try {
            const aptRes = await axiosClient.get(`${appointmentServiceUrl}/my-appointments?limit=1`, {
                headers: { 'X-User-Role': 'admin', 'X-User-Id': 'admin' }
            });
            totalAppointments = aptRes.data.total || 0;
        } catch (e) { console.error('Stats: Failed to fetch appointment count'); }

        try {
            const payRes = await axiosClient.get(`${paymentServiceUrl}/all?limit=5`, {
                headers: { 'X-User-Role': 'admin', 'X-User-Id': 'admin' }
            });
            totalRevenue = (payRes.data.data || []).reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
            // Note: In a real system, you'd have a dedicated stats endpoint in payment service to get the true sum.
            // For now, we'll return the stats we have.
            recentPayments = payRes.data.data || [];
        } catch (e) { console.error('Stats: Failed to fetch payment stats'); }

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    patients: patientCount,
                    doctors: doctorCount,
                    admins: adminCount,
                    verifiedDoctors: verifiedDoctorCount
                },
                appointments: {
                    total: totalAppointments
                },
                financials: {
                    totalRevenue, // This is mock-ish since it only sums the first page
                    recentPayments
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get comprehensive platform analytics
// @route   GET /analytics
// @access  Private (Admin Only)
exports.getPlatformAnalytics = async (req, res, next) => {
    try {
        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5005';

        const [appointmentStats, paymentStats] = await Promise.all([
            axiosClient.get(`${appointmentServiceUrl}/analytics`, {
                headers: { 'X-User-Role': 'admin', 'X-User-Id': 'admin' }
            }).catch(e => ({ data: { data: { daily: [], specialty: [] } } })),
            axiosClient.get(`${paymentServiceUrl}/analytics`, {
                headers: { 'X-User-Role': 'admin', 'X-User-Id': 'admin' }
            }).catch(e => ({ data: { data: [] } }))
        ]);

        res.status(200).json({
            success: true,
            data: {
                appointments: appointmentStats.data.data,
                revenue: paymentStats.data.data
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add a new user (Admin)
// @route   POST /user
exports.addUser = async (req, res, next) => {
    try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
        const response = await axiosClient.post(`${authServiceUrl}/internal/admin/create-user`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        if (err.response) return res.status(err.response.status).json(err.response.data);
        next(err);
    }
};

// @desc    Update a user (Admin)
// @route   PUT /user/:id
exports.updateUser = async (req, res, next) => {
    try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
        const response = await axiosClient.put(`${authServiceUrl}/internal/admin/update-user/${req.params.id}`, req.body);
        res.status(200).json(response.data);
    } catch (err) {
        if (err.response) return res.status(err.response.status).json(err.response.data);
        next(err);
    }
};

// @desc    Cancel an appointment (Admin)
// @route   PUT /appointment/cancel/:id
exports.cancelAppointment = async (req, res, next) => {
    try {
        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';
        const response = await axiosClient.put(`${appointmentServiceUrl}/cancel/${req.params.id}`, {}, {
            headers: { 'X-User-Role': 'admin', 'X-User-Id': 'admin' }
        });
        res.status(200).json(response.data);
    } catch (err) {
        if (err.response) return res.status(err.response.status).json(err.response.data);
        next(err);
    }
};

// @desc    Reschedule an appointment (Admin)
// @route   PUT /appointment/reschedule/:id
exports.rescheduleAppointment = async (req, res, next) => {
    try {
        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';
        const response = await axiosClient.put(`${appointmentServiceUrl}/${req.params.id}`, req.body, {
            headers: { 'X-User-Role': 'admin', 'X-User-Id': 'admin' }
        });
        res.status(200).json(response.data);
    } catch (err) {
        if (err.response) return res.status(err.response.status).json(err.response.data);
        next(err);
    }
};



