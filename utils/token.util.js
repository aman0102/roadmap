const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(userId, email, role) {
    return jwt.sign(
        { 
            id: userId,
            email: email, 
            role: role
        },
        process.env.JWT_SECRET,
        {
            //expiresIn: '15m'
            expiresIn: '3h' // For testing purpose, change it to 15m in production
        }
    );
}

function generateRefreshToken(userId) {
    const jti = crypto.randomUUID();
    const refreshToken = jwt.sign(
        { id: userId,
          jti: jti 
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '7d'
        }
    );
    return {
        refreshToken, 
        jti
    };
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
};