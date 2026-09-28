const fs = require('node:fs');
const path = require('node:path');

const filename = process.argv[2];
if(!filename) {
  console.error('Usage: node stream-test.js <file-path>');
  process.exit(1);
}

const filePath = path.resolve(filename);
console.log(`Reading file: ${filePath}`);
const readStream = fs.createReadStream(filePath, {
  highWaterMark: 16,
});
let count = 0;
readStream.on('data', (chunk) => {
  count += 1;
  console.log(`\nChunk ${count} (${chunk.length} bytes):`);
  console.log(chunk.toString());
});
readStream.on('end', () => {
  console.log(`\nFinished reading ${count} chunk(s).`);
});
readStream.on('error', (error) => {
  console.error(`Unable to read "${filePath}": ${error.message}`);
  process.exitCode = 1;
});
//for running the script, use the command: node stream-test.js <file-path> where <file-path> is the path to the file you want to read.
// node stream-test.js files/stream-test.txt