class AppError extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);

        this.statusCode = statusCode;
        // Mark this error as operational (trusted) so that it can be handled gracefully
        // isOperational = true means: "This error was expected, we understand it, and it's safe to communicate its message to the client."
        this.isOperational = true;
        this.errors = errors;
    }
}

module.exports = AppError;