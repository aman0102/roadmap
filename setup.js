const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

beforeAll(async () => {
    // clean test database before running tests
    await pool.query('TRUNCATE refresh_tokens, users RESTART IDENTITY CASCADE');

    const hashedPassword = await bcrypt.hash('password123', 12);
    await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin Test User', 'admin@gmail.com', hashedPassword, 'admin']
    );
});

afterAll(async () => {
    await pool.end();
});