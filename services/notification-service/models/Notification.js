const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: String,
            required: [true, 'Recipient ID is required'],
        },
        recipientEmail: {
            type: String,
            default: null,
        },
        recipientPhone: {
            type: String,
            default: null,
        },
        type: {
            type: String,
            enum: ['email', 'sms', 'both'],
            default: 'email',
        },
        category: {
            type: String,
            enum: [
                'appointment_booked',
                'appointment_completed',
                'appointment_cancelled',
                'payment_received',
                'prescription_issued',
                'general',
            ],
            default: 'general',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
        },
        message: {
            type: String,
            required: [true, 'Message body is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        sentAt: {
            type: Date,
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
