const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

function generateAccessToken(userId, email, role) {
    return jwt.sign(
        { 
            id: userId,
            email: email, 
            role: role
        },
        config.jwt.secret,
        {
            expiresIn: '15m'
            //expiresIn: '3h' // For testing purpose, change it to 15m in production
        }
    );
}

function generateRefreshToken(userId) {
    const jti = crypto.randomUUID();
    const refreshToken = jwt.sign(
        { id: userId,
          jti: jti 
        },
        config.jwt.refreshSecret,
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