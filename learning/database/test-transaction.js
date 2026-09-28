require('dotenv').config();

const withTransaction = require('../utils/transaction');

async function testTransaction() {
    try {
        await withTransaction(async (client) => {

            console.log('Transaction started');

            await client.query(`
                INSERT INTO users (name, email, password)
                VALUES ('Transaction User 1', 'transaction1@test.com', 'test123')
            `);

            console.log('First user inserted');

            await client.query(`
                INSERT INTO users (name, email, password)
                VALUES ('Transaction User 2', 'transaction@test.com', 'test123')
            `);

            console.log('Second user inserted');
        });

        console.log('Transaction committed');

    } catch (error) {
        console.log('Transaction rolled back');
        console.error(error.message);
    }
}

testTransaction();