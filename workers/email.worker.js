require('dotenv').config();

const { Worker } = require('bullmq');
const connection = require('../config/redis');
const transporter = require('../config/mailer');

console.log('Redis connection established');

const worker = new Worker(
  'email',
  async (job) => {
    logger.info({
      jobId: job.id
    }, 'Processing email job');

    const { to, subject, text } = job.data;
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    });

    logger.info({
        jobId: job.id,
        messageId: info.messageId
    }, 'Email sent');

    return 'Email sent successfully';

  },
  {
    connection: connection,
    concurrency: 3,// 3 workers can process jobs concurrently
  }
);


worker.on('ready', () => {
  console.log('4. Worker is READY');
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.log(`Job ${job?.id} failed:`, error.message);
});

worker.on('error', (error) => {
  console.log('Worker error:', error);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down worker...');

  await worker.close();

  console.log('Worker shut down successfully.');

  process.exit(0);
});

// Handle SIGINT (Ctrl+C) signal to gracefully shut down the worker
process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down worker...');

  await worker.close();

  console.log('Worker shut down successfully.');

  process.exit(0);
});

console.log('Email worker started...');