const multer = require("multer");

function globalErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                statusCode: 400,
                message: 'File size must not exceed 50 KB'
            });
        }
    }

    return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message || 'Internal Server Error'
    });
}

module.exports = globalErrorHandler;