function sanitizeFileName(fileName) {
    // Replace any character that is not a letter, number, dot, underscore, or hyphen with an underscore
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_');
}

module.exports = {
    sanitizeFileName
};