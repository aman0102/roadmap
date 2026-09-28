const handleDatabaseError = require('../utils/databaseError');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const multer = require('multer');
const errorMiddleware = (error, req, res, next) => {
  // Handle Multer file upload errors
  if (error instanceof multer.MulterError) {

    if (error.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(
        res,
        400,
        'File size must not exceed 5 MB'
      );
    }

    return errorResponse(
      res,
      400,
      error.message
    );
  }
    

  // Handle PostgreSQL errors
  // This function checks if the error is a known database error and returns a formatted response if it is.
   // PostgreSQL errors like foreign key violations, invalid text representation, etc.
  const databaseError = handleDatabaseError(error);
  if(databaseError){
      return errorResponse(
        res,
        databaseError.statusCode,
        databaseError.message
      );
  }

  // Our intentional application errors
  const statusCode = error.statusCode || 500;

  // custom error logging can be added here
  if(error.isOperational){
    return errorResponse(
      res,
      statusCode,
      error.message,
      error.errors || null
    );
  }
  
  // Handle JSON parsing errors (invalid JSON in request body)
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return errorResponse(
      res,
      400,
      'Invalid JSON format'
    );
  }

  // Unexpected errors are logged and a generic message is sent to the client
  // console.error(error.stack);
  // replacing console.error with logger.error for better logging
  logger.error({
    requestId: req.requestId,
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
    statusCode: statusCode
  });

  return errorResponse(
    res,
    500,
    'Internal Server Error'
  );
};

module.exports = errorMiddleware;   