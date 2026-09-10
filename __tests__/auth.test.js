const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

let accessToken;

describe('POST /auth/login', () => {
    
    beforeAll(async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });

        accessToken = response.body.accessToken;
    });

    test('should login successfully with valid credentials', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
    });

    test('should return 401 with an incorrect password', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
    });

    test('should return 401 with a non-existent email', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'doesnotexist@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(401);
    });

    test('should return 400 when login data is invalid', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'not-an-email',
                password: '123'
            });

        expect(response.status).toBe(400);
    });

    test('should reject the old refresh token after rotation', async () => {
        const agent = request.agent(app);
        const loginResponse = await agent
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });
        expect(loginResponse.status).toBe(200);
        const oldCookie = loginResponse.headers['set-cookie'][0].split(';')[0];
        const refreshResponse = await agent
            .post('/auth/refresh');

        expect(refreshResponse.status).toBe(200);

        const oldTokenResponse = await request(app)
            .post('/auth/refresh')
            .set('Cookie', oldCookie);
        expect(oldTokenResponse.status).toBe(401);  
    });

    test('should logout successfully with a valid refresh token', async () => {
        const agent = request.agent(app);

        const loginResponse = await agent
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });

        expect(loginResponse.status).toBe(200);
        const response = await agent
            .post('/auth/logout');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logout successful');
    });

    test('should reject the refresh token after logout', async () => {
        const agent = request.agent(app);
        const loginResponse = await agent
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });

        expect(loginResponse.status).toBe(200);
        const oldCookie = loginResponse.headers['set-cookie'][0].split(';')[0];

        const logoutResponse = await agent
            .post('/auth/logout');

        expect(logoutResponse.status).toBe(200);

        const refreshResponse = await request(app)
            .post('/auth/refresh')
            .set('Cookie', oldCookie);
        
        expect(refreshResponse.status).toBe(401);
    });

    test('should refresh access token with a valid refresh token', async () => {
        const agent = request.agent(app);

        await agent
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });

        const response = await agent
            .post('/auth/refresh');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.message).toBe('Token refreshed successfully');

    });

    test('should return 401 when refresh token is missing', async () => {
        const response = await request(app)
            .post('/auth/refresh');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Refresh token required');
    });

    test('should return 401 with an invalid refresh token', async () => {
        const response = await request(app)
            .post('/auth/refresh')
            .set('Cookie', 'refreshToken=invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid or expired refresh token');
    });

    test('should return 401 when refresh token is missing during logout', async () => {
        const response = await request(app)
            .post('/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Refresh token required');
    });

    test('should return 401 with an invalid refresh token during logout', async () => {
        const response = await request(app)
            .post('/auth/logout')
            .set('Cookie', 'refreshToken=invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid or expired refresh token');
    });

    test('should return 401 when access token is missing', async () => {
        const response = await request(app)
            .get('/users');

        expect(response.status).toBe(401);
    });

    test('should return 401 with a malformed authorization header', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', 'InvalidToken');

        expect(response.status).toBe(401);
    });

    test('should return 401 with an invalid access token', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
    });

    test('should allow access with a valid access token', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
    });
    // we wont wait for 15 minutes to test the expired access token, 
    // so we will create a new access token with a very short expiration 
    // time for testing purposes

    test('should return 401 with an expired access token', async () => {
        const expiredToken = jwt.sign(
            {
                id: 1,
                email: 'admin@gmail.com',
                role: 'admin'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '-1s'
            }
        );

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
    });

    test('should not expose user passwords', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        response.body.users.forEach(user=>{
            expect(user).not.toHaveProperty('password');
        })
    });

    test('should set a new refresh token cookie after refresh', async () => {
        const agent = request.agent(app);
        const loginResponse = await agent
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });
        const oldCookie = loginResponse.headers['set-cookie'][0];

        const refreshResponse = await agent
            .post('/auth/refresh');

        const newCookie = refreshResponse.headers['set-cookie'][0];
        expect(refreshResponse.headers['set-cookie']).toBeDefined();
        expect(refreshResponse.headers['set-cookie'].length).toBeGreaterThan(0);
        expect(refreshResponse.status).toBe(200);
        expect(newCookie).not.toEqual(oldCookie);
    });
});