const express = require('express');
const router = express.Router();

const emailQueue = require('../queues/email.queue');

router.post('/send-email', async (req, res, next) => {
  try{
    const { email } = req.body;
    const job = await emailQueue.add('send-test-Email', { 
        to : email,
        subject: 'Test Email',
        text: 'This is a test email sent from the email queue.'
    });
    res.status(200).json({ 
        message: 'Email job added to queue',
        jobId : job.id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;