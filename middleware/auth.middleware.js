const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // send error response to centralized error handler
        return next(new AppError('Authorization header missing or malformed', 401));
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        // send error response to centralized error handler
        return next(new AppError('Invalid authorization format', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token', 401));
    }
}

module.exports = authMiddleware;