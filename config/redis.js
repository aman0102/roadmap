// Redis configuration
// BullMQ uses Redis as a backend to store job and queue information. 
// The connection object is used to configure the Redis connection for the BullMQ worker.

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
};

module.exports = connection