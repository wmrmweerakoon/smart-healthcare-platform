// Global error handler middleware for API Gateway
const errorHandler = (err, req, res, next) => {
    console.error('Gateway Error:', err);

    // Proxy errors
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: 'Service unavailable - the requested service is not running',
        });
    }

    if (err.code === 'ECONNRESET') {
        return res.status(504).json({
            success: false,
            message: 'Service timeout - the requested service did not respond',
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Gateway Error',
    });
};

module.exports = errorHandler;
