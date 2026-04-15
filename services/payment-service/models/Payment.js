const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: [true, 'Patient ID is required'],
        },
        doctorId: {
            type: String,
            default: null,
        },
        appointmentId: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount must be positive'],
        },
        currency: {
            type: String,
            default: 'usd',
            enum: ['usd', 'lkr', 'eur', 'gbp'],
        },
        description: {
            type: String,
            default: 'Healthcare consultation payment',
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['stripe', 'payhere'],
            default: 'stripe',
        },
        stripePaymentIntentId: {
            type: String,
            default: null,
        },
        stripeClientSecret: {
            type: String,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookups
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
