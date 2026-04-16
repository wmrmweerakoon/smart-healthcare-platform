const twilio = require('twilio');

/**
 * Sends SMS via Twilio or falls back to Mock log if credentials are missing.
 */
const sendSMS = async ({ to, message }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromPhone) {
        try {
            const client = twilio(accountSid, authToken);
            const result = await client.messages.create({
                body: message,
                from: fromPhone,
                to: to
            });

            console.log(`[SMS] Real SMS sent to ${to} via Twilio. SID: ${result.sid}`);
            return {
                success: true,
                provider: 'twilio',
                deliveryStatus: 'sent',
                timestamp: new Date().toISOString(),
                to,
                messageId: result.sid,
            };
        } catch (err) {
            console.error('[SMS] Twilio sending failed:', err.message);
            throw new Error(`Twilio error: ${err.message}`);
        }
    } else {
        // High-Fidelity Professional Mock Fallback
        const timestamp = new Date().toLocaleString();
        const messageId = `msg_${Math.random().toString(36).substring(2, 11)}`;

        console.log('\n' + '='.repeat(60));
        console.log('🚀 [NOTIF-GATEWAY] OUTBOUND SMS SIMULATION');
        console.log('-'.repeat(60));
        console.log(`| ID:        ${messageId}`);
        console.log(`| TIMESTAMP: ${timestamp}`);
        console.log(`| DEST:      ${to}`);
        console.log(`| CARRIER:   Virtual-Healthcare-Net`);
        console.log(`| CONTENT:   "${message}"`);
        console.log('-'.repeat(60));
        console.log(`| STATUS:    ✅ DELIVERED (Simulated)`);
        console.log('='.repeat(60) + '\n');
 
        return {
            success: true,
            provider: 'simulation-suite',
            deliveryStatus: 'delivered',
            timestamp: new Date().toISOString(),
            to,
            messageId,
        };

    }
};

module.exports = { sendSMS };

