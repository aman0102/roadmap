require('dotenv').config();
const withTransaction = require('../utils/transaction');

const userRepository = require('../repository/user.repository');

async function test() {
    try {
        await withTransaction(async (client) => {

            console.log('Transaction started');

            // First operation
            await userRepository.createUserWithClient(client, {
                name: 'Rollback Test User',
                email: 'rollback-test@test.com',
                password: 'test123'
            });

            console.log('First user inserted');

            // Second operation - deliberately uses an existing email
            await userRepository.createUserWithClient(client, {
                name: 'Rollback Test User 2',
                email: 'transaction-service@test.com',
                password: 'test123'
            });

            console.log('Second user inserted');
        });

        console.log('Transaction committed');

    } catch (error) {
        console.error('Transaction failed:');
        console.error(error.message);
    }
}

test();