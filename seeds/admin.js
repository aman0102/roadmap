const bcrypt = require('bcrypt');
const { pool, closePool } = require('../config/database');

async function seedAdmin() {
  const name = 'Admin';
  const email = 'admin@example.com';
  const password = 'password123';
  const role = 'admin';

  try {
    // Check whether admin already exists
    const existingAdmin = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password using the same bcrypt cost as the application
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert admin
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role]
    );

   console.log('Admin user created successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

seedAdmin();