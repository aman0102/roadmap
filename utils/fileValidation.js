/*
Why we're doing this

Suppose someone uploads: malicious.exe

but claims:

Content-Type: image/png

Multer sees:

file.mimetype === 'image/png'
and our current filter(fileFilter in upload.middleware.js) could accept it.

fileTypeFromFile() actually examines the bytes of the saved file.
*/
let fileTypeFromFile;
// example: req.file.buffer and ['image/jpeg','image/png','image/heic']
async function validateFileType(buffer, allowedTypes) {

  if (!fileTypeFromFile) {
    // Dynamically import the file-type module only when needed
    // This is done to avoid potential issues with static imports in certain environments
    // we use commonjs dynamic import syntax to load the file-type module at runtime.
    const fileType = await import('file-type');
    fileTypeFromBuffer = fileType.fileTypeFromBuffer;
  }

  // check the actual file type of the uploaded file using the file-type library
  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType) {
    return false;
  }

  // Check if the detected MIME type is in the list of allowed types
  // return true if the detected MIME type is in the list of allowed types, otherwise return false
  return allowedTypes.includes(detectedType.mime);
}

module.exports = {
  validateFileType
};