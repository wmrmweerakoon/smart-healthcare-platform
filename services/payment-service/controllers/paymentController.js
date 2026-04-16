const axios = require('axios');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5004';

// @desc    Create a new payment (Stripe PaymentIntent)
// @route   POST /create-payment
exports.createPayment = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { amount, currency, appointmentId, doctorId, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid positive amount is required',
            });
        }

        // Create Stripe PaymentIntent
        let paymentIntent;
        try {
            if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
                paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Stripe uses cents
                    currency: currency || 'usd',
                    metadata: {
                        patientId: userId,
                        appointmentId: appointmentId || '',
                        doctorId: doctorId || '',
                    },
                });
            } else {
                // Mock response for local development without a real Stripe key
                paymentIntent = {
                    id: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
                    client_secret: 'secret_mock_' + Math.random().toString(36).substr(2, 9),
                    status: 'requires_payment_method'
                };
            }
        } catch (stripeError) {
            console.error('Stripe Error:', stripeError.message);
            return res.status(502).json({
                success: false,
                message: 'Payment gateway error: ' + stripeError.message,
            });
        }

        // Save payment record in DB
        const payment = await Payment.create({
            patientId: userId,
            doctorId: doctorId || null,
            appointmentId: appointmentId || null,
            amount,
            currency: currency || 'usd',
            description: description || 'Healthcare consultation payment',
            status: 'pending',
            paymentMethod: 'stripe',
            stripePaymentIntentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
        });

        res.status(201).json({
            success: true,
            data: {
                paymentId: payment._id,
                clientSecret: paymentIntent.client_secret,
                stripePaymentIntentId: paymentIntent.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify / confirm a payment
// @route   POST /verify-payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'paymentIntentId is required',
            });
        }

        // Retrieve payment intent from Stripe
        let paymentIntent;
        try {
            if (paymentIntentId.startsWith('pi_mock_')) {
                // Mock retrieval
                paymentIntent = {
                    id: paymentIntentId,
                    status: 'succeeded' // Simulate a successful payment when verified
                };
            } else {
                paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            }
        } catch (stripeError) {
            console.error('Stripe Error:', stripeError.message);
            return res.status(502).json({
                success: false,
                message: 'Payment gateway error: ' + stripeError.message,
            });
        }

        // Map Stripe status to our application status
        let appStatus;
        switch (paymentIntent.status) {
            case 'succeeded':
                appStatus = 'completed';
                break;
            case 'canceled':
                appStatus = 'cancelled';
                break;
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
            case 'processing':
                appStatus = 'pending';
                break;
            default:
                appStatus = 'failed';
        }

        // Update payment record
        const payment = await Payment.findOneAndUpdate(
            { stripePaymentIntentId: paymentIntentId },
            { status: appStatus },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found',
            });
        }

        // If payment succeeded and has an appointmentId, update the appointment service
        if (appStatus === 'completed' && payment.appointmentId) {
            try {
                await axios.put(`${APPOINTMENT_SERVICE_URL}/internal/payment-status/${payment.appointmentId}`, {
                    status: 'paid'
                });
            } catch (err) {
                console.error(`Failed to update appointment payment status for appointment ${payment.appointmentId}:`, err.message);
                // Do not block the user response, just log the error. In production, a retry mechanism should be used.
            }
        }

        res.status(200).json({
            success: true,
            data: {
                paymentId: payment._id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                stripeStatus: paymentIntent.status,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all payments for the authenticated user
// @route   GET /my-payments
exports.getMyPayments = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const payments = await Payment.find({ patientId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments({ patientId: userId });

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: payments,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all payments (admin)
// @route   GET /all
exports.getAllPayments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.patientId) filter.patientId = req.query.patientId;

        const payments = await Payment.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: payments,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single payment by ID
// @route   GET /:id
exports.getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment analytics for admin
// @route   GET /analytics
exports.getAnalytics = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyRevenue = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: dailyRevenue
        });
    } catch (err) {
        next(err);
    }
};

