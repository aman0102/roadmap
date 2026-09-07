const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { createUserSchema, updateUserSchema, userIdSchema, updateUserRoleSchema} = require('../validators/user.validator');
const { validate } =require( '../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeUser = require('../middleware/authorizeUser.middleware');
const authorizeRoles = require('../middleware/role.middleware');
    
router.post('/', validate(createUserSchema), userController.createUser);
router.get('/',authMiddleware, authorizeRoles('admin'), userController.getAllUsers);
/*
For admin role test
router.get('/admin-test', authMiddleware, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Admin access granted' });
});
*/
router.patch('/:id/role',authMiddleware, authorizeRoles('admin'), validate(userIdSchema, 'params'), validate(updateUserRoleSchema), userController.updateUserRole)
router.get('/:id',authMiddleware, validate(userIdSchema, 'params'), authorizeUser, userController.getUserById);
router.patch('/:id',authMiddleware, validate(userIdSchema, 'params'), authorizeUser, validate(updateUserSchema) ,userController.updateUser);
router.delete('/:id', authMiddleware, validate(userIdSchema, 'params'), authorizeUser, userController.deleteUser);

module.exports = router;