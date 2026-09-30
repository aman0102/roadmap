require('dotenv').config();
const logger = require('../utils/logger');
const {Pool} = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,


  max: 10,
  idleTimeoutMillis: 30000, // How long can an unused pool connection remain idle?
  connectionTimeoutMillis: 2000, // How long to establish DB connection?
  statement_timeout: 5000 //a postgres query will be canceled if it runs for more than 5 seconds
});

pool.on('error', (error) => {
    logger.error({
        message: 'Unexpected PostgreSQL pool error',
        error: error.message,
        stack: error.stack
    });
});

async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  closePool
};