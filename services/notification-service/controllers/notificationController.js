const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

// @desc    Send an email notification
// @route   POST /send-email
exports.sendEmailNotification = async (req, res, next) => {
    try {
        const { recipientId, recipientEmail, subject, message, category } = req.body;

        if (!recipientEmail || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'recipientEmail, subject, and message are required',
            });
        }

        // Save notification record
        const notification = await Notification.create({
            recipientId: recipientId || 'unknown',
            recipientEmail,
            type: 'email',
            category: category || 'general',
            subject,
            message,
            status: 'pending',
        });

        // Send email
        try {
            const result = await sendEmail({
                to: recipientEmail,
                subject,
                text: message,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">HealthCare+</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #1f2937;">${subject}</h2>
                        <p style="color: #4b5563; line-height: 1.6;">${message}</p>
                    </div>
                    <div style="padding: 15px; text-align: center; background: #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            &copy; 2024 HealthCare+ Platform. All rights reserved.
                        </p>
                    </div>
                </div>`,
            });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: 'Email notification sent successfully',
                data: {
                    notificationId: notification._id,
                    messageId: result.messageId,
                    previewUrl: result.previewUrl,
                },
            });
        } catch (emailError) {
            notification.status = 'failed';
            notification.errorMessage = emailError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send email: ' + emailError.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Send an SMS notification
// @route   POST /send-sms
exports.sendSMSNotification = async (req, res, next) => {
    try {
        const { recipientId, recipientPhone, message, category } = req.body;

        if (!recipientPhone || !message) {
            return res.status(400).json({
                success: false,
                message: 'recipientPhone and message are required',
            });
        }

        const notification = await Notification.create({
            recipientId: recipientId || 'unknown',
            recipientPhone,
            type: 'sms',
            category: category || 'general',
            subject: 'SMS Notification',
            message,
            status: 'pending',
        });

        try {
            const result = await sendSMS({ to: recipientPhone, message });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: 'SMS notification sent successfully',
                data: {
                    notificationId: notification._id,
                    smsMessageId: result.messageId,
                },
            });
        } catch (smsError) {
            notification.status = 'failed';
            notification.errorMessage = smsError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send SMS: ' + smsError.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger notification for appointment booked
// @route   POST /appointment-booked
exports.appointmentBooked = async (req, res, next) => {
    try {
        const { patientEmail, patientName, doctorName, date, time } = req.body;

        if (!patientEmail) {
            return res.status(400).json({
                success: false,
                message: 'patientEmail is required',
            });
        }

        const subject = 'Appointment Confirmed - HealthCare+';
        const message = `Dear ${patientName || 'Patient'},\n\nYour appointment with Dr. ${doctorName || 'your doctor'} has been confirmed.\n\nDate: ${date || 'TBD'}\nTime: ${time || 'TBD'}\n\nPlease log in to your dashboard for more details.\n\nBest regards,\nHealthCare+ Team`;

        const notification = await Notification.create({
            recipientId: req.body.patientId || 'unknown',
            recipientEmail: patientEmail,
            type: 'email',
            category: 'appointment_booked',
            subject,
            message,
            status: 'pending',
        });

        try {
            const result = await sendEmail({
                to: patientEmail,
                subject,
                text: message,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">HealthCare+</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #059669;">✅ Appointment Confirmed</h2>
                        <p style="color: #4b5563;">Dear ${patientName || 'Patient'},</p>
                        <p style="color: #4b5563;">Your appointment has been confirmed with the following details:</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                            <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Doctor</td><td style="padding: 8px; color: #4b5563;">Dr. ${doctorName || 'N/A'}</td></tr>
                            <tr style="background: #f3f4f6;"><td style="padding: 8px; font-weight: bold; color: #374151;">Date</td><td style="padding: 8px; color: #4b5563;">${date || 'TBD'}</td></tr>
                            <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Time</td><td style="padding: 8px; color: #4b5563;">${time || 'TBD'}</td></tr>
                        </table>
                        <p style="color: #4b5563;">Please log in to your dashboard for more details.</p>
                    </div>
                    <div style="padding: 15px; text-align: center; background: #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2024 HealthCare+ Platform</p>
                    </div>
                </div>`,
            });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: 'Appointment booked notification sent',
                data: {
                    notificationId: notification._id,
                    previewUrl: result.previewUrl,
                },
            });
        } catch (emailError) {
            notification.status = 'failed';
            notification.errorMessage = emailError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send notification: ' + emailError.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger notification for appointment completed
// @route   POST /appointment-completed
exports.appointmentCompleted = async (req, res, next) => {
    try {
        const { patientEmail, patientName, doctorName, date } = req.body;

        if (!patientEmail) {
            return res.status(400).json({
                success: false,
                message: 'patientEmail is required',
            });
        }

        const subject = 'Appointment Completed - HealthCare+';
        const message = `Dear ${patientName || 'Patient'},\n\nYour appointment with Dr. ${doctorName || 'your doctor'} on ${date || 'today'} has been completed.\n\nPlease check your dashboard for any prescriptions or follow-up instructions.\n\nThank you for choosing HealthCare+.\n\nBest regards,\nHealthCare+ Team`;

        const notification = await Notification.create({
            recipientId: req.body.patientId || 'unknown',
            recipientEmail: patientEmail,
            type: 'email',
            category: 'appointment_completed',
            subject,
            message,
            status: 'pending',
        });

        try {
            const result = await sendEmail({
                to: patientEmail,
                subject,
                text: message,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">HealthCare+</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #2563eb;">📋 Appointment Completed</h2>
                        <p style="color: #4b5563;">Dear ${patientName || 'Patient'},</p>
                        <p style="color: #4b5563;">Your appointment with Dr. ${doctorName || 'your doctor'} on ${date || 'today'} has been completed successfully.</p>
                        <p style="color: #4b5563;">Please check your dashboard for any prescriptions or follow-up instructions.</p>
                        <p style="color: #4b5563;">Thank you for choosing HealthCare+.</p>
                    </div>
                    <div style="padding: 15px; text-align: center; background: #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2024 HealthCare+ Platform</p>
                    </div>
                </div>`,
            });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: 'Appointment completed notification sent',
                data: {
                    notificationId: notification._id,
                    previewUrl: result.previewUrl,
                },
            });
        } catch (emailError) {
            notification.status = 'failed';
            notification.errorMessage = emailError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send notification: ' + emailError.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger notification to doctor for new appointment request
// @route   POST /doctor-appointment-received
exports.doctorAppointmentReceived = async (req, res, next) => {
    try {
        const { doctorEmail, doctorName, patientName, date, time, doctorId } = req.body;

        if (!doctorEmail) {
            return res.status(400).json({
                success: false,
                message: 'doctorEmail is required',
            });
        }

        const subject = 'New Appointment Request - HealthCare+';
        const message = `Dear Dr. ${doctorName || 'Doctor'},\n\nA new appointment request has been booked by ${patientName || 'a patient'}.\n\nDate: ${date || 'TBD'}\nTime: ${time || 'TBD'}\n\nPlease log in to your dashboard to view and accept this request.\n\nBest regards,\nHealthCare+ Team`;

        const notification = await Notification.create({
            recipientId: doctorId || 'unknown',
            recipientEmail: doctorEmail,
            type: 'email',
            category: 'appointment_booked',
            subject,
            message,
            status: 'pending',
        });

        try {
            const result = await sendEmail({
                to: doctorEmail,
                subject,
                text: message,
            });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: 'Doctor appointment notification sent',
            });
        } catch (emailError) {
            notification.status = 'failed';
            notification.errorMessage = emailError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send notification: ' + emailError.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger notification to doctor for cancelled appointment
// @route   POST /doctor-appointment-cancelled
exports.doctorAppointmentCancelled = async (req, res, next) => {
    try {
        const { doctorEmail, doctorName, patientName, date, doctorId } = req.body;

        if (!doctorEmail) {
            return res.status(400).json({
                success: false,
                message: 'doctorEmail is required',
            });
        }

        const subject = 'Appointment Cancelled - HealthCare+';
        const message = `Dear Dr. ${doctorName || 'Doctor'},\n\nThe appointment requested by ${patientName || 'a patient'} on ${date || 'a specific date'} has been cancelled.\n\nBest regards,\nHealthCare+ Team`;

        const notification = await Notification.create({
            recipientId: doctorId || 'unknown',
            recipientEmail: doctorEmail,
            type: 'email',
            category: 'appointment_cancelled',
            subject,
            message,
            status: 'pending',
        });

        try {
            const result = await sendEmail({
                to: doctorEmail,
                subject,
                text: message,
            });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: 'Doctor cancellation notification sent',
            });
        } catch (emailError) {
            notification.status = 'failed';
            notification.errorMessage = emailError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send cancellation notification',
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger notification to patient for appointment status update (accepted/rejected)
// @route   POST /patient-appointment-status-updated
exports.patientAppointmentStatusUpdated = async (req, res, next) => {
    try {
        const { patientEmail, patientName, doctorName, date, status, patientId } = req.body;

        if (!patientEmail) {
            return res.status(400).json({
                success: false,
                message: 'patientEmail is required',
            });
        }

        const subject = `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)} - HealthCare+`;
        
        let message;
        if (status === 'accepted') {
            message = `Dear ${patientName || 'Patient'},\n\nGood news! Your appointment with Dr. ${doctorName || 'your doctor'} on ${date || 'a specific date'} has been accepted.\n\nPlease log in to your dashboard to proceed to payment and finalize your slot.\n\nBest regards,\nHealthCare+ Team`;
        } else {
            message = `Dear ${patientName || 'Patient'},\n\nWe regret to inform you that Dr. ${doctorName || 'your doctor'} could not accept your appointment request on ${date || 'a specific date'}.\n\nPlease try booking a different time or with another specialist.\n\nBest regards,\nHealthCare+ Team`;
        }

        const notification = await Notification.create({
            recipientId: patientId || 'unknown',
            recipientEmail: patientEmail,
            type: 'email',
            category: `appointment_${status}`,
            subject,
            message,
            status: 'pending',
        });

        try {
            const result = await sendEmail({
                to: patientEmail,
                subject,
                text: message,
            });

            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: `Patient ${status} notification sent`,
            });
        } catch (emailError) {
            notification.status = 'failed';
            notification.errorMessage = emailError.message;
            await notification.save();

            return res.status(502).json({
                success: false,
                message: 'Failed to send status update notification',
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all notifications (with filters)
// @route   GET /all
exports.getAllNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.type) filter.type = req.query.type;
        if (req.query.recipientId) filter.recipientId = req.query.recipientId;

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get notifications for a user
// @route   GET /my-notifications
exports.getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ recipientId: userId });

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /read/:id
exports.markAsRead = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.recipientId !== userId && req.headers['x-user-role'] !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to read this notification' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};
