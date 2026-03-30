// Role-based access control middleware
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - please login first',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied - role '${req.user.role}' is not authorized`,
            });
        }

        next();
    };
};

module.exports = { roleCheck };
