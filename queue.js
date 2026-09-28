const queue = [];

function addJob(job){
    queue.push(job);
    console.log('job added', job);
}

function getNextJob(){
    return queue.shift();
}

module.exports = {
    addJob,
    getNextJob
};