const { Queue } = require('bullmq');
const connection = require('../config/redis');

const emailQueue = new Queue('email', { 
    connection,

    defaultJobOptions: {
        attempts: 3, // Number of retry attempts
        backoff: {
            type: 'exponential', // Exponential backoff strategy
            delay: 5000, // Initial delay in milliseconds (5 seconds)
        },
        removeOnComplete: 100, // Number of completed jobs to keep in the queue
        removeOnFail: 1000, // Number of failed jobs to keep in the queue
    },
});
module.exports = emailQueue;