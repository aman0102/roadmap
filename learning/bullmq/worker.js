const { getNextJob } = require('../queue');

function processJob(job) {
    console.log('Processing job:', job);
}

const job = getNextJob();

if (job) {
    processJob(job);
} else {
    console.log('No jobs available');
}