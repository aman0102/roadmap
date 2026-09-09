const {pool} = require('../config/database');
async function create(refreshToken) {
    const {userId, jti, tokenHash, expiresAt} = refreshToken;
    const result = await pool.query('INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING id, user_id, jti, token_hash, expires_at', [userId, jti, tokenHash, expiresAt]);
    return result.rows[0];
}
async function findByJti(jti) {
    const result = await pool.query(
        'SELECT id, user_id, jti, token_hash, expires_at FROM refresh_tokens WHERE jti = $1',
        [jti]
    );
    return result.rows[0] || null;
}
async function removeById(id) {
    const result = await pool.query('DELETE FROM refresh_tokens WHERE id = $1 RETURNING id, user_id, jti, token_hash, expires_at', [id]);
    return result.rows[0] || null;
}
module.exports = {
    create,
    findByJti,
    removeById
};
