const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');
app.use(express.json());
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
//Register this function with Express. If an error reaches the error-handling stage, use this function.
app.use(errorMiddleware);
module.exports = app;