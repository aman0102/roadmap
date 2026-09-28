const {addJob, getNextJob} = require('../queue');

addJob({
    type: 'email',
    email: 'alice@example.com'
})

addJob({
    type: 'email',
    email: 'bob@example.com'
})

// console.log('Next job:', getNextJob());
// console.log('Next job:', getNextJob());
// console.log('Next job:', getNextJob());

