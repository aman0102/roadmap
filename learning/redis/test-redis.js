require('dotenv').config();

const redisClient = require('../config/redis.client');

async function testredis() {
    await redisClient.set('test-name', 'Aman', 'EX', 30);
    console.log('Immediately after SET:');

    console.log('Value:', await redisClient.get('test-name'));
    console.log('TTL:', await redisClient.ttl('test-name'));
    await redisClient.quit();
}

testredis();