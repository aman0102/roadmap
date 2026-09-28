require('dotenv').config();
const fs = require('fs/promises');
const { uploadToS3, getFromS3, deleteFromS3 } = require('../utils/s3');
console.log('AWS REGION:', process.env.AWS_REGION);
console.log('AWS BUCKET:', process.env.AWS_S3_BUCKET);
async function testS3() {
    try{
        console.log(require('path').join(__dirname, '..', 'test-image.jpg'))
        const file = await fs.readFile(
            require('path').join(__dirname, '..', 'test-image.jpg')
        );
        const result = await uploadToS3(file, 'tests/test-image.jpg');
        console.log('S3 upload successful');
        console.log(result);

    } catch (error) {
        console.error('S3 upload failed');
        console.error(error);
    }
}

async function testS3Operations() {
    try{
        const result = await getFromS3('tests/test-image.jpg');
        console.log('S3 GET successful');
        console.log('Content Type:', result.ContentType);
        console.log('Content Length:', result.ContentLength);

        const deleteResult = await deleteFromS3('tests/test-image.jpg');
        console.log('S3 DELETE successful');
        console.log(deleteResult);
    } catch (error) {
        console.error('S3 GET failed');
        console.error(error);
    }
}


testS3Operations();
//testS3();