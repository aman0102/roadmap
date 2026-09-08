const userService = require('../services/user.service');
const AppError = require('../utils/AppError');

async function getAllUsers(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { role, search, sort, order} = req.query; // Optional role and search filter
  const users = await userService.getAllUsers(page, limit, role, search, sort, order);
  return res.json(users);
}
  
async function getUserById(req, res) {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return res.json(user);
}

async function createUser(req, res) {
  const newUser = await userService.createUser(req.body || {});
  return res.status(201).json(newUser);
}

async function updateUser(req, res) {
  // Placeholder for update user logic
  const user = await userService.updateUser(req.params.id, req.body);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return res.json(user);
}

async function deleteUser(req, res) {
  // Placeholder for delete user logic
  const user = await userService.deleteUser(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return res.json({
    message: 'User deleted successfully',
    user,
  });
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const user = await userService.updateUserRole(id, role, req.user && req.user.id);
  return res.json({
    message: 'User role updated successfully',
    user,
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
};