const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./openapi.yaml');

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

const emailRoutes = require('./routes/email.routes');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

const errorMiddleware = require('./middleware/error.middleware');
const loggerMiddleware = require('./middleware/logger.middleware')
// upload routes
const uploadRoutes = require('./routes/upload.routes');
const config = require('./config/env');
app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));
app.use(express.json());

app.use(
    '/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

app.use(cookieParser());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/emails', emailRoutes);
app.use('/upload', uploadRoutes);
//Register this function with Express. If an error reaches the error-handling stage, use this function.
app.use(errorMiddleware);
module.exports = app;