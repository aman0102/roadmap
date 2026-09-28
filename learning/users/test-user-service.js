const userService = require('../services/user.service');

const test = async () => {
    try {
            const result = await userService.createUserWithTransaction({
                name: 'Test User',
                email: 'transaction-failure@test.com',
                password: 'test-password'
            });
            console.log('User created:', result);
    } catch (error) {
        console.error(error.message);
    }
}
test()