// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        return res.status(404).json({ success: false, message: error.message });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        return res.status(400).json({ success: false, message: error.message });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File size exceeds the 10MB limit',
        });
    }

    // Multer unexpected file error
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected file field',
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
