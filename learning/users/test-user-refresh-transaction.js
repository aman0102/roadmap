require('dotenv').config();

const withTransaction = require('../utils/transaction');

const userRepository = require('../repository/user.repository');
const refreshTokenRepository = require('../repository/refreshToken.repository');

async function test() {

    try {

        await withTransaction(async (client) => {

            console.log('Transaction started');

            // 1. Create user
            const newUser = await userRepository.createUserWithClient(
                client,
                {
                    name: 'Repository Transaction User',
                    email: 'repository-transaction@test.com',
                    password: 'hashed-password'
                }
            );

            console.log('User created:', newUser.id);

            // 2. Create refresh token
            await refreshTokenRepository.createWithClient(
                client,
                {
                    userId: newUser.id,
                    jti: 'repository-test-jti',
                    tokenHash: 'test-hash',
                    expiresAt: new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                    )
                }
            );

            console.log('Refresh token created');

            // 3. Deliberately fail
            throw new Error('Simulated failure');

        });

        console.log('Transaction committed');

    } catch (error) {

        console.log('Transaction rolled back');
        console.error(error.message);

    }
}

test();