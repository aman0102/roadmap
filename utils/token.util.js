const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(userId, email) {
    return jwt.sign(
        { id: userId, email: email },
        process.env.JWT_SECRET,
        {
            expiresIn: '15m'
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