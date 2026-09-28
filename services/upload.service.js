const crypto = require('crypto');
const AppError = require('../utils/AppError');

const { validateFileType } = require('../utils/fileValidation');
const {
    uploadToS3,
    getFromS3,
    deleteFromS3,
    generateDownloadUrl,
    generateUploadUrl
} = require('../utils/s3');

async function uploadFile(file) {

    const isValid = await validateFileType(
        file.buffer,
        [
            'image/png',
            'image/jpeg',
            'image/heic'
        ]
    );

    if (!isValid) {
        throw new AppError('Invalid image file', 400);
    }

    const key = `uploads/${crypto.randomUUID()}-${file.originalname}`;

    await uploadToS3(
        file.buffer,
        key
    );

    return {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        key
    };
}

async function getFile(key) {

    return await getFromS3(key);

}

async function deleteFile(key) {

    return await deleteFromS3(key);

}

async function generateFileDownloadUrl(key) {
    return await generateDownloadUrl(key);
}

async function generateFileUploadUrl(key, contentType) {
    return await generateUploadUrl(key, contentType);
}
module.exports = {
    uploadFile,
    getFile,
    deleteFile,
    generateFileDownloadUrl,
    generateFileUploadUrl
};
