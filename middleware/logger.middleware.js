const logger = require('../utils/logger');
const {randomUUID} = require('crypto');
const loggerMiddleware = (req, res, next)=>{
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    const start = Date.now();
    
    res.on('finish',()=>{
        const duration = Date.now()-start;
        logger.info({
            requestId: requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: duration
        });
    })
    next();
}

module.exports = loggerMiddleware