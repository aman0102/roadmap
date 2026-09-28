function successResponse(res, statusCode, data, message = null) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

function errorResponse(res, statusCode, message, errors = null) {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
}

module.exports = {
    successResponse,
    errorResponse
};