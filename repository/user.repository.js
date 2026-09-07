const AppError = require('../utils/AppError');
const pool = require('../config/database');

async function findById(id) {
    //throw new Error('Database connection failed');
    const result = await pool.query('SELECT id, name, email, role FROM users where id = $1', [id]);
    return result.rows[0] || null;
}
async function findAll() {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    return result.rows;
}
async function create(user) {
    const { name, email, password } = user;
    // inserting a user but not role because role is defaulted to 'user' in the database schema
    // user must not be allowed to set their own role to 'admin' or any other role, this is a security risk
    const newUser = await pool.query('INSERT into users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role', [name, email, password]);
    return newUser.rows[0];
}
async function update(id, updatedUser) {
    const { name, email, password } = updatedUser;
    // updating a user but not role because user must not be allowed to set their own role to 'admin' or any other role, this is a security risk
    const result = await pool.query('UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), password = COALESCE($3, password) WHERE id = $4 RETURNING id, name, email', [name, email, password, id]);
    return result.rows[0] || null;
}
async function remove(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);
  return result.rows[0] || null;
}
async function findByEmail(email) {
    const resuult  = await pool.query('SELECT id, name, email, password, role FROM users where email = $1', [email]);
    return resuult.rows[0] || null;
}
// function to update the role of a user, this function should only be called by an admin user
async function updateRole(id, role) {
    const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role', [role, id]);
    return result.rows[0] || null;
}
module.exports = {
    findById,
    findAll,
    create,
    update,
    remove,
    findByEmail,
    updateRole
};