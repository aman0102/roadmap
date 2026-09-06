const userService = require('../services/user.service');
const AppError = require('../utils/AppError');

async function getAllUsers(req, res) {
  const users = await userService.getAllUsers();
  res.json(users);
}

const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return res.json(user);
};

async function createUser(req, res) {
  const newUser = await userService.createUser(req.body || {});
  return res.status(201).json(newUser);
}

async function updateUser(req, res) {
  // Placeholder for update user logic
  const user = await userService.updateUser(
    req.params.id,
    req.body);
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
  return res.json({ message: 'User deleted successfully' ,
    user
  });
}


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};