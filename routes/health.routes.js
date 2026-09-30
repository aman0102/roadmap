const express = require('express');
const { checkReadiness } = require('../services/health.service');

const router = express.Router();

router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

router.get('/ready', async (req, res) => {
  const result = await checkReadiness();

  if (!result.ready) {
    return res.status(503).json({
      status: 'not_ready',
      database: result.database,
      redis: result.redis
    });
  }

  res.status(200).json({
    status: 'ok',
    database: result.database,
    redis: result.redis
  });
});


module.exports = router;