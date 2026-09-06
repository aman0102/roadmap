const AppError = require('../utils/AppError');
const authorizeUser = (req, res, next) => {
    const loggedInUserId = req.user.id ; // Assuming the logged-in user is attached to the request object by the auth middleware
    const requestedUserId = Number(req.params.id); // Assuming the user ID is passed as a route parameter

    if (loggedInUserId !== requestedUserId) {
        return next(new AppError('You are not allowed to access this user', 403));
    }

    next();
};
module.exports = authorizeUser;