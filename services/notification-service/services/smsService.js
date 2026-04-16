/**
 * Mock SMS Service
 * 
 * DESIGN FOR SCALE:
 * This service is currently a mock implementation as per the development requirements.
 * It is architected to be easily swappable with a production-grade provider.
 * 
 * RECOMMENDED PROVIDERS:
 * - Twilio (Global)
 * - Vonage / Nexmo (Global)
 * - Dialog / Mobitel SMS Gateways (Regional - SL)
 * 
 * INTEGRATION STEPS:
 * 1. Install provider SDK (e.g., `npm install twilio`)
 * 2. Add API credentials to .env (ACCOUNT_SID, AUTH_TOKEN, etc.)
 * 3. Replace the log logic in `sendSMS` with the SDK call.
 */

const sendSMS = async ({ to, message }) => {
    // PRE-PROCESSING: Ensure 'to' is in E.164 format if needed
    
    // Simulate sending SMS via console log (Production Simulation)
    console.log('\n📱 [SMS GATEWAY SIMULATION]');
    console.log(`| TO:      ${to}`);
    console.log(`| MESSAGE: ${message}`);
    console.log(`| STATUS:  Delivered (Simulated)`);
    console.log(`| PROVIDER: Mock-Internal-Gateway\n`);

    // Simulate network latency (150ms - 300ms)
    const latency = Math.floor(Math.random() * 150) + 150;
    await new Promise((resolve) => setTimeout(resolve, latency));

    return {
        success: true,
        provider: 'mock',
        deliveryStatus: 'delivered',
        timestamp: new Date().toISOString(),
        to,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
};

module.exports = { sendSMS };
