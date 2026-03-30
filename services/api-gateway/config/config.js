// Service URL configuration
const config = {
    port: process.env.PORT || 5000,
    services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
        patient: process.env.PATIENT_SERVICE_URL || 'http://localhost:5002',
        doctor: process.env.DOCTOR_SERVICE_URL || 'http://localhost:5003',
        appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5004',
        payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005',
        notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5006',
        ai: process.env.AI_SERVICE_URL || 'http://localhost:5007',
    },
    jwtSecret: process.env.JWT_SECRET || 'healthcare_jwt_secret_key_2024',
};

module.exports = config;
