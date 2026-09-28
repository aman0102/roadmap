const { PutObjectCommand , GetObjectCommand, DeleteObjectCommand, HeadObjectCommand} = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3")
const AppError = require("./AppError");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// The key is how we tell S3 which file we're talking about.
async function uploadToS3(file, key) {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file
    });

    const result = await s3Client.send(command);
    console.log(`File uploaded successfully: ${result}`);
    return result;
}

async function getFromS3(key) {
        console.log('herererereeeeee:');
    const exists = await checkS3ObjectExists(key);
    console.log('exists:', exists);
    if (!exists) {
        throw new AppError(`File not found in S3: ${key}`, 404);
    }
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    const result = await s3Client.send(command);
    console.log(`File retrieved successfully: ${result}`);
    return result;
}

async function deleteFromS3(key) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    const result = await s3Client.send(command);
    console.log(`File deleted successfully: ${result}`);
    return result;
}
/*
@param {string} key - The S3 object key to check for existence.
@return {Promise<boolean>} - Returns true if the object exists, false if it does not exist.
@throws {Error} - Throws an error for any unexpected issues during the check.
*/
async function checkS3ObjectExists(key) {
    const command = new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    try {
        await s3Client.send(command);
        console.log(`File exists in S3: ${key}`);
        return true; // Object exists
    } catch (error) {
        console.log('S3 HEAD error name:', error.name);
        console.log('S3 HEAD error code:', error.Code);
        console.log(
            'S3 HEAD status:',
            error.$metadata?.httpStatusCode
        );
        // explicitly check for unknown error and 403
        // s3 returns 403 for "Not Found" in some cases, especially with certain bucket policies or permissions.
        // So treating 403 here as a special case to indicate that the object does not exist, rather than a generic error.
        if (
            error.name === 'NotFound' ||
            error.name === 'NoSuchKey' ||
            (
                error.name === 'Unknown' &&
                error.$metadata?.httpStatusCode === 403
            )
        ) {
            console.log(`File does not exist in S3: ${key}`);
            return false;
        }

        throw error;
    }
}

async function generateDownloadUrl(key){
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    const url = await getSignedUrl(
        s3Client, 
        command,
        { 
            expiresIn: 3600 
        }
    );

    return url;
}

async function generateUploadUrl(key, contentType){
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType
    });

    const url = await getSignedUrl(
        s3Client, 
        command,
        { 
            expiresIn: 3600 
        }
    );

    return url;
}

module.exports = {
    uploadToS3,
    getFromS3,
    deleteFromS3,
    checkS3ObjectExists,
    generateDownloadUrl,
    generateUploadUrl
};