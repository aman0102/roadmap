const express = require('express');
const upload = require('../middleware/upload.middleware');
const router = express.Router();
const { uploadFile, getFile, deleteFile, getPresignedUrl, getUploadPresignedUrl} = require('../controllers/upload.controller');

router.post('/', upload.single('file'), uploadFile);

router.post(
    '/presigned-upload',
    getUploadPresignedUrl
);

router.get('/presigned/*splat', getPresignedUrl);
/*
    Route to retrieve a file from S3
    we set headers and content type because s3 sends the file as a stream 
    rether than a single file so we want the browser to handle it correctly.
    We want Express to capture everything after /upload/, including that

        For example:

    GET /upload/uploads/abc123-photo.jpg

    Express captures:

    req.params.splat

    as roughly:

    ["uploads", "abc123-photo.jpg"]
    Then:

    req.params.splat.join('/')

    turns it back into:

    uploads/abc123-photo.jpg

*/
router.get('/*splat', getFile);


router.delete('/*splat', deleteFile);

module.exports = router;