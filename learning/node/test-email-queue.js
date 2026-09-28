require('dotenv').config();

const emailQueue = require('../queues/email.queue');


async function checkQueue() {
  const counts = await emailQueue.getJobCounts(
    'waiting',
    'active',
    'completed',
    'failed',
    'delayed'
  );

  console.log(counts);

  await emailQueue.close();
}

checkQueue();