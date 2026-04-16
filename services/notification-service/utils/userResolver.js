const axios = require('axios');

/**
 * Resolves a userId into a complete user object (email, name, phone)
 * by calling the Auth Service's internal endpoint.
 */
const resolveUser = async (userId) => {
    try {
        if (!userId || userId === 'unknown') return null;

        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
        const response = await axios.get(`${authServiceUrl}/internal/user/${userId}`);
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (err) {
        console.error(`[UserResolver] Failed to resolve user ${userId}:`, err.message);
        return null;
    }
};

module.exports = { resolveUser };
