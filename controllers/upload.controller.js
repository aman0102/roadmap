const crypto = require('crypto');
const AppError = require('../utils/AppError');
const {
    uploadFile: uploadFileService,
    getFile: getFileService,
    deleteFile: deleteFileService,
    generateFileDownloadUrl,
    generateFileUploadUrl
} = require('../services/upload.service');

const { successResponse } = require('../utils/response');
const { sanitizeFileName } = require('../utils/fileName');

async function uploadFile(req, res, next) {

    try {
        const file = await uploadFileService(req.file);

        return successResponse(
            res,
            200,
            {
                file
            },
            'File uploaded successfully'
        );

    } catch (error) {

        next(error);

    }

}
// Route to retrieve a file from S3
// we set headers and content type because s3 sends the file as a stream 
// rether than a single file so we want the browser to handle it correctly.
// We want Express to capture everything after /upload/, including that
/*
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
async function getFile(req, res, next) {

    try {
        const key = req.params.splat.join('/');

        const result = await getFileService(key);

        res.setHeader(
            'Content-Type',
            result.ContentType || 'application/octet-stream'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment'
        );

        if (result.ContentLength) {

            res.setHeader(
                'Content-Length',
                result.ContentLength
            );

        }

        console.log('S3 GET successful');

        result.Body.pipe(res);

    } catch (error) {

        next(error);

    }

}

async function deleteFile(req, res, next) {

    try {

        const key = req.params.splat.join('/');
        
        await deleteFileService(key);

        return successResponse(
            res,
            200,
            null,
            'File deleted successfully'
        );

    } catch (error) {

        next(error);

    }

}

async function getPresignedUrl(req, res, next) {
    try {
        const key = req.params.splat.join('/');

        const url = await generateFileDownloadUrl(key);

        return successResponse(
            res,
            200,
            {
                url
            },
            'Presigned URL generated successfully'
        );

    } catch (error) {
        next(error);
    }
}

async function getUploadPresignedUrl(req, res, next) {
    try {
        const { fileName, contentType } = req.body;
        if (!fileName || !contentType) {
            throw new AppError(
                'fileName and contentType are required',
                400
            );
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/heic'
        ];

        if (!allowedTypes.includes(contentType)) {
            throw new AppError(
                'Only JPEG, PNG and HEIC files are allowed',
                400
            );
        }
        const safeFileName = sanitizeFileName(fileName);
        const key = `uploads/${crypto.randomUUID()}-${safeFileName}`;
        const url = await generateFileUploadUrl(key, contentType);
        return successResponse(
            res,
            200,
            {
                url
            },
            'Presigned URL generated successfully'
        );
    } catch (error) {
        next(error);

    }
}

module.exports = {
    uploadFile,
    getFile,
    deleteFile,
    getPresignedUrl,
    getUploadPresignedUrl
};