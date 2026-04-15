const nodemailer = require('nodemailer');

// Create transporter — uses SMTP config from env, falls back to Ethereal (test) account
let transporter;

const initTransporter = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        // Production / real SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('Email transporter configured with SMTP settings');
    } else {
        // Fallback to Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('Email transporter configured with Ethereal test account');
        console.log(`  Test email user: ${testAccount.user}`);
    }
};

const sendEmail = async ({ to, subject, text, html }) => {
    if (!transporter) {
        await initTransporter();
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"HealthCare+ Platform" <noreply@healthcareplus.com>',
        to,
        subject,
        text,
        html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);

    // For Ethereal, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('Preview URL:', previewUrl);
    }

    return {
        messageId: info.messageId,
        previewUrl: previewUrl || null,
    };
};

module.exports = { initTransporter, sendEmail };
