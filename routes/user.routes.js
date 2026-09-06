const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { createUserSchema,updateUserSchema, userIdSchema } = require('../validators/user.validator');
const { validate } =require( '../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeUser = require('../middleware/authorizeUser.middleware');
    
router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id',authMiddleware, validate(userIdSchema, 'params'), authorizeUser,userController.getUserById);
router.patch('/:id',authMiddleware, validate(userIdSchema, 'params'),validate(updateUserSchema) ,userController.updateUser);
router.delete('/:id', authMiddleware, validate(userIdSchema, 'params'), userController.deleteUser);

module.exports = router;