const multer = require('multer');
const path = require('path');
// for storing uploaded files in memory(ram) before uploading them to S3, we can use multer's memoryStorage. This allows us to access the file buffer directly and upload it to S3 without saving it to disk first.
const storage = multer.memoryStorage();

// commented out diskStorage because we are using memoryStorage to store the file in memory before uploading it to S3. This is more efficient and avoids writing the file to disk, which can be slower and less secure.
// Configure multer storage and file filter
// The storage option defines where and how the uploaded files will be stored.
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         // extracts the file extension from the original file name and generates a unique name for the uploaded file using the current timestamp and a random number.
//         const extension = path.extname(file.originalname);
//         // Generate a unique name for the uploaded file using the current timestamp and a random number
//         // example 1758791234567-483729182.heic
//         const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
//         cb(null, uniqueName);
//     },
// });

const upload = multer({
    // The storage option specifies the storage engine to use for uploaded files. In this case, we are using diskStorage, which saves files to the local filesystem.
    // We're telling Multer: Use the memory storage configuration we created above
    // in this case use ram to store the file before uploading it to S3
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },

    fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith('image/')) {
            cb(null, true);// Accept the file
        } else {
            // Reject the file and create a custom error
            // Now our existing operational-error section handles it
            const error = new Error('Only image files are allowed');

            error.statusCode = 400;
            error.isOperational = true;

            cb(error);
        }

    }
});

module.exports = upload;