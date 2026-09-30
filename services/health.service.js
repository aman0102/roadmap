const { pool } = require('../config/database');
const redisClient = require('../config/redis.client');

async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    return 'ok';
  } catch (error) {
    return 'error';
  }
}

async function checkRedis() {
  try {
    await Promise.race([
      redisClient.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 2000)
      )
    ]);

    return 'ok';
  } catch (error) {
    return 'error';
  }
}

async function checkReadiness() {
  const [database, redis] = await Promise.all([
    checkDatabase(),
    checkRedis()
  ]);

  const ready = database === 'ok' && redis === 'ok';

  return {
    ready,
    database,
    redis
  };
}

module.exports = {
  checkReadiness
};