// Middleware to extract user info from API Gateway headers
const extractUser = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized — missing user identification headers',
        });
    }

    req.user = {
        id: userId,
        role: userRole,
    };

    next();
};

module.exports = { extractUser };
