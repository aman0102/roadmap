const userService = require('../services/user.service');
async function login(req, res) {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
        message: 'Login successful',
        accessToken: result.accessToken,
        user: result.user
    });
}

async function refresh(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }
    const result = await userService.refreshAccessToken(refreshToken);
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
            message: 'Token refreshed successfully',
            accessToken: result.accessToken,
    });
}

async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            message: 'Refresh token required'
        });
    }
    await userService.logoutUser(refreshToken);
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    });

    return res.json({
        message: 'Logout successful'
    });
}
module.exports = {
    login,
    refresh,
    logout
};
