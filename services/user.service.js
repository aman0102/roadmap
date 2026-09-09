const bcrypt = require('bcrypt');
const userRepository = require('../repository/user.repository');
const refreshTokenRepository = require('../repository/refreshToken.repository');
const {generateRefreshToken, generateAccessToken} = require('../utils/token.util');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

async function getAllUsers(page, limit, role, search, sort, order) {
  const offset = (page - 1) * limit;
  const users = await userRepository.findAll(limit, offset, role, search, sort, order);
  const totalUsers = await userRepository.countUsers(role, search);
  const totalPages = Math.ceil(totalUsers / limit);
  return { users, page, totalUsers, limit, totalPages };
}

async function getUserById(id) {
  return userRepository.findById(id);
}

async function createUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 12);
  return userRepository.create({ ...user, password: hashedPassword });
}

async function updateUser(id, updatedUser) {
  const hashedPassword = updatedUser.password ? await bcrypt.hash(updatedUser.password, 12) : undefined;
  if (hashedPassword) {
    updatedUser.password = hashedPassword;
  }
  return userRepository.update(id, updatedUser);
}

async function deleteUser(id) {
  return userRepository.remove(id);
}
// login password comparison
async function loginUser(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = await createAndStoreRefreshToken(user.id);
  return {
    accessToken,
    refreshToken,
    user:{ 
      id: user.id, 
      name: user.name, 
      email: user.email,
      role: user.role
    }
  }
}

async function refreshAccessToken(refreshToken) {
  let decoded;
  try{
    // Verify the refresh token using the refresh secret
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  }catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  // Here you would typically check the refresh token against your database to ensure it's valid and not revoked.
  const storedToken = await refreshTokenRepository.findByJti(decoded.jti);
  if (!storedToken) {
    throw new AppError('Refresh token not found', 401);
  }
  // check if the refresh token is expired
  if (new Date(storedToken.expires_at) < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }
  // Compare the provided refresh token with the stored hashed token
  // It compares the provided refresh token with the hashed version stored in the database
  const isMatch = await bcrypt.compare(refreshToken, storedToken.token_hash);
  if (!isMatch) {
    throw new AppError('Invalid refresh token', 401);
  }
  // remove the old refresh token from the database
  // we use the id  and not userId because we want to remove the specific token that was used for refreshing, not all tokens for the user
  await refreshTokenRepository.removeById(storedToken.id);
  const newRefreshToken = await createAndStoreRefreshToken(decoded.id); 
  // Fetch the user details from the database using the decoded id from the refresh token
  const user = await userRepository.findById(decoded.id);
  // Generate a new access token
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  return { accessToken, refreshToken: newRefreshToken }; 
}
// helper function to create and store a refresh token in the database to avoid repetition of code in the loginUser and refreshAccessToken functions
async function createAndStoreRefreshToken(userId) {
  const { refreshToken, jti } = generateRefreshToken(userId);

  const tokenHash = await bcrypt.hash(refreshToken, 12);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await refreshTokenRepository.create({
    userId,
    jti,
    tokenHash,
    expiresAt
  });

  return refreshToken;
}

async function logoutUser(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  const storedToken = await refreshTokenRepository.findByJti(decoded.jti);
  if (!storedToken) {
    throw new AppError('Refresh token not found', 401);
  }
  const isMatch = await bcrypt.compare(refreshToken, storedToken.token_hash);
  if (!isMatch) {
    throw new AppError('Invalid refresh token', 401);
  }
  await refreshTokenRepository.removeById(storedToken.id);
  
}
/*
targetUserId     → whose role are we changing?
role             → what role are we assigning?
requestingUserId → who is making the request?
*/
async function updateUserRole(targetUserId, role, requestingUserId) {
  if(targetUserId===requestingUserId){
        throw new AppError(
        'You cannot change your own role',
        403
    );
  }
  const result = await userRepository.updateRole(targetUserId, role);
  if (!result) {
      throw new AppError('User not found', 404);
  }
  return result;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateUserRole
};