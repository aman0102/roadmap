const AppError = require('../utils/AppError');
const {pool} = require('../config/database');

async function findById(id) {
    //throw new Error('Database connection failed');
    const result = await pool.query('SELECT id, name, email, role FROM users where id = $1', [id]);
    return result.rows[0] || null;
}
async function findAll(limit, offset, role, search, sort, order) {
    // here we explixitly telling db that $3 is a text type and if role is not provided then it will be null, this is important
    // because if we don't do this then the query will fail because role is an enum type and null is not a valid enum value
    /*
     $3 = NULL
      ↓
     $3::text IS NULL → TRUE
      ↓
    all users

    CODE LOGIC
    ORDER BY ${ sortColumn==='id' ? `id $(sortOrder)`: `LOWER($(sortColumn)) $(sortOrder)` },id ASC
    since id can not be passed to LOWER function because it is an integer type, so we are checking if sortColumn 
    is id then we are ordering by id and if it is not id then we are ordering by LOWER(sortColumn) and then by id
    in ascending order to maintain the order of the records when the sortColumn has duplicate values.
    */
    const allowedSortColumns = { id: 'id', name: 'name', email: 'email', role: 'role' };
    const sortColumn = allowedSortColumns[sort] || 'id'; // Default to 'id' if invalid sort column is provided
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC'; // Default to 'ASC' if invalid order is provided
    const result = await pool.query(
       `SELECT id, name, email, role 
        FROM users 
        WHERE ($3::text IS NULL OR role = $3)
        AND (
             $4::text IS NULL
             OR name ILIKE '%' || $4 || '%'
             OR email ILIKE '%' || $4 || '%'
        )
        ORDER BY ${
            sortColumn === 'id'
                ? `id ${sortOrder}`
                : `LOWER(${sortColumn}) ${sortOrder}`
        }, id ASC
        LIMIT $1 OFFSET $2`, 
        [limit, offset, role || null, search || null]
    );
    return result.rows;
}
async function countUsers(role, search) {
    const result = await pool.query(
        `SELECT COUNT(*) 
        FROM users WHERE ($1::text IS NULL OR role = $1)
        AND (
             $2::text IS NULL
             OR name ILIKE '%' || $2 || '%'
             OR email ILIKE '%' || $2 || '%'
         )`, [role || null, search || null]
    );
    return Number(result.rows[0].count);
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
    const result = await pool.query('UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), password = COALESCE($3, password) WHERE id = $4 RETURNING id, name, email, role', [name, email, password, id]);
    return result.rows[0] || null;
}
async function remove(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email, role', [id]);
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
    countUsers,
    create,
    update,
    remove,
    findByEmail,
    updateRole
};