const express = require('express');
const router = express.Router();
const {validate} = require('../middleware/validate.middleware');
const authController = require('../controllers/auth.controller');
const { loginSchema } = require('../validators/auth.validator');
const { ro } = require('zod/v4/locales');

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
module.exports = router;