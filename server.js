const app = require('./app');
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

/* 
This is a simple Node.js server that listens on port 3000 and responds with "Hello World" to any incoming HTTP requests.

const http = require('node:http');

const server = http.createServer((req,res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
 */

/*
function test() {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Test function executed');
        resolve('Test function completed');
      }, 5000);
  })
  
}

async function main() {
  console.log('before test function');
  const result = await test();  
  setTimeout(() => {
    console.log('after 2 seconds');
  }, 2000);
  console.log(result);
  console.log('after test function');
}
main();

*/
