const AppError = require('../utils/AppError');
const pool = require('../config/database');

async function findById(id) {
    //throw new Error('Database connection failed');
    const result = await pool.query('SELECT id, name, email FROM users where id = $1', [id]);
    return result.rows[0] || null;
}
async function findAll() {
    const result = await pool.query('SELECT id, name, email FROM users');
    return result.rows;
}
async function create(user) {
    const { name, email, password } = user;
    const newUser = await pool.query('INSERT into users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, password]);
    return newUser.rows[0];
}
async function update(id, updatedUser) {
    const { name, email, password } = updatedUser;
    const result = await pool.query('UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), password = COALESCE($3, password) WHERE id = $4 RETURNING id, name, email', [name, email, password, id]);
    return result.rows[0] || null;
}
async function remove(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);
  return result.rows[0] || null;
}
async function findByEmail(email) {
    const resuult  = await pool.query('SELECT id, name, email, password FROM users where email = $1', [email]);
    return resuult.rows[0] || null;
}
module.exports = {
    findById,
    findAll,
    create,
    update,
    remove,
    findByEmail
};