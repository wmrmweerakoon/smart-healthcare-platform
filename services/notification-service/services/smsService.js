// Mock SMS Service
// In production, replace with Twilio, Vonage, or similar provider

const sendSMS = async ({ to, message }) => {
    // Simulate sending SMS
    console.log('─── SMS Sent (Mock) ───');
    console.log(`  To: ${to}`);
    console.log(`  Message: ${message}`);
    console.log('───────────────────────');

    // Simulate a small delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
        success: true,
        provider: 'mock',
        to,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
};

module.exports = { sendSMS };
