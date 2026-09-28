const { addJob, getNextJob} = require('./queue');

async function processJob(job) {
    job.status = 'processing';
    console.log(`Processing job: ${job.type}`);
    console.log(`Job status: ${job.status}`);
    
    await new Promise((resolve, reject) => {
        setTimeout(() => {

            if (job.email === 'bob@example.com') {
                reject(new Error('Email service failed'));
                return;
            }

            console.log(`Email sent to ${job.email}`);
            job.status = 'completed';
            console.log(`Job status: ${job.status}`);
            resolve();
        }, 3000); // Simulate job processing delay
    }
)
}

async function startWorker(workerName) {
    console.log(`Worker ${workerName} started`);
    while (true) {
        const job = getNextJob();

        if (job) {
            console.log(`Worker ${workerName} picked up job`);
            try {  
                job.attempts += 1;
                await processJob(job);
            } catch (error) {
                console.error(`Job failed: ${error.message}`);
                job.status = 'failed';
                console.log(`Job status: ${job.status}`);
            }
        } else {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
                console.log('checking for new jobs...');
            });
        }
    }
}

// Producer adds jobs
addJob({
    id: 1,
    type: 'WELCOME_EMAIL',
    email: 'alice@example.com',
    status: 'waiting',
    attempts: 0
});

addJob({
    id: 2,
    type: 'RESET_PASSWORD',
    email: 'bob@example.com',
    status: 'waiting',
    attempts: 0
});

startWorker('Worker 1');
startWorker('Worker 2');