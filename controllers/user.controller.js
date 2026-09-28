const userService = require('../services/user.service');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

async function getAllUsers(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { role, search, sort, order} = req.query; // Optional role and search filter
  const users = await userService.getAllUsers(page, limit, role, search, sort, order);
  return successResponse(res, 200, users);
}
  
async function getUserById(req, res) {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return successResponse(res, 200, user);
}

async function createUser(req, res) {
  const newUser = await userService.createUser(req.body || {});
  return successResponse(res, 201, newUser);
}

async function updateUser(req, res) {
  // Placeholder for update user logic
  const user = await userService.updateUser(req.params.id, req.body);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return successResponse(res, 200, user);
}

async function deleteUser(req, res) {
  // Placeholder for delete user logic
  const user = await userService.deleteUser(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return successResponse(
    res,
    200,
    user,
    'User deleted successfully'
  );
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const user = await userService.updateUserRole(id, role, req.user && req.user.id);
  return successResponse(
    res,
    200,
    user,
    'User role updated successfully'
  );
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
};