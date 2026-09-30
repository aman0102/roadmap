const queue = [];
const logger = require('../utils/logger');

function addJob(job){
    queue.push(job);
    logger.info({
        jobId: job.id
    }, 'Job added');
}

function getNextJob(){
    return queue.shift();
}

module.exports = {
    addJob,
    getNextJob
};