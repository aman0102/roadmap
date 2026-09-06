class AppError extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
    }
}

module.exports = AppError;