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

// Flexible role-based guard
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied — role '${req.user.role}' is not authorized`,
            });
        }
        next();
    };
};

module.exports = { extractUser, roleGuard };
