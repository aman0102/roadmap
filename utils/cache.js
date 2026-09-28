const redisClient = require('../config/redis.client');

async function invalidateUsersCache() {

  const stream = await redisClient.scanStream({
    match: 'users:*'
  });
  const keys = [];

  for await(const batch of stream) {
    keys.push(...batch);
  }
  /*
  exaample of batch keys that might be returned by the scanStream:

    users:1:10:all::id:asc
    users:2:10:all::id:asc
    users:1:10:user::id:asc
    users:1:10:admin::id:asc
    
    batch = [
        'users:1',
        'users:2'
    ];
  */

  //Delete all the matching cache keys.
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

}

module.exports = {
  invalidateUsersCache
};