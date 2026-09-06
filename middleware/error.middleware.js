const handleDatabaseError = require('../utils/databaseError');
const errorMiddleware = (error, req, res, next) => {
  // Handle PostgreSQL errors
  // This function checks if the error is a known database error and returns a formatted response if it is.
   // PostgreSQL errors like foreign key violations, invalid text representation, etc.
  const databaseError = handleDatabaseError(error);
  if(databaseError){
    return res.status(databaseError.statusCode).json({message: databaseError.message});
  }
  // Our intentional application errors
  const statusCode = error.statusCode || 500;
  // custom error logging can be added here
  if(error.isOperational){
    const response = {
      message: error.message
    }
    if(error.errors){
      response.errors = error.errors;
    }

    return res.status(statusCode).json(response);
  }

  // Handle JSON parsing errors (invalid JSON in request body)
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      message: 'Invalid JSON format'
    });
  }

  // Unexpected errors are logged and a generic message is sent to the client
  return res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorMiddleware;   