const ratelimit = require('express-rate-limit');

const loginRateLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: 'Too many login attempts. Please try again later.'
    },
    skip: () => process.env.NODE_ENV === 'test'// Skip rate limiting during tests
})
module.exports = {
    loginRateLimiter
}