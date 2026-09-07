const AppError = require('./AppError');
function handleDatabaseError(error) {
    // Log the error for debugging purposes
    switch (error.code) {
        case '23505': // Unique violation
            return new AppError('A record with this value already exists', 409);
        case '23503': // Foreign key violation
            return new AppError('This record cannot be modified because it is referenced by another record', 409);
        case '22P02': // Invalid text representation
            return new AppError('A required field is missing', 400);
        default:
            return null; // Return null for unhandled error codes
    }
}
module.exports = handleDatabaseError;