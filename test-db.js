const pool = require('./config/database');
const testDatabase = async () => {
  const result = await pool.query('SELECT * FROM users');
  console.log('Database connection successful:', result.rows);   
  await pool.end(); // Close the database connection after the test
};
testDatabase();