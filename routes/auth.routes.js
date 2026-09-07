const express = require('express');
const router = express.Router();
const {validate} = require('../middleware/validate.middleware');
const authController = require('../controllers/auth.controller');
const { loginSchema } = require('../validators/auth.validator');
const {loginRateLimiter} = require('../middleware/rateLimit.middleware')

router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
module.exports = router;