
const requiredEnvVariables = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL'
];

for(const variable of requiredEnvVariables) {
    if(!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
    }
}
// Validate PORT
const port = Number(process.env.PORT || 3000);

if(!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT must be a valid number between 1 and 65535`);
}

// Validate NODE_ENV
const allowedEnvironments = ['development', 'production', 'test'];
const nodeEnv = process.env.NODE_ENV || 'development';

if(!allowedEnvironments.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of ${allowedEnvironments.join(', ')}: ${nodeEnv}`);
}

// Validate FRONTEND_URL
try {
    new URL(process.env.FRONTEND_URL);
} catch (err) {
    throw new Error(`FRONTEND_URL must be a valid URL`);
}

module.exports = {
    port: port,
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET
    },

    frontendUrl: process.env.FRONTEND_URL,

    nodeEnv
};