const request = require('supertest');
const app = require('../app'); // Adjust the path to your Express app
const jwt = require('jsonwebtoken');
const { closePool } = require('../config/database'); // Adjust the path to your database configuration
describe('GET /users', () => {
     beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'password123'
            });

        adminToken = loginResponse.body.accessToken;
        const userResponse = await request(app)
            .post('/users')
            .send({
                name: 'Normal Test User',
                email: `normal-${Date.now()}@example.com`,
                password: 'password123'
            });

        const userLoginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: userResponse.body.email,
                password: 'password123'
            });

        userToken = userLoginResponse.body.accessToken;
    });
    test('should return 401 without authorization', async () => {
        const response = await request(app)
            .get('/users');
            expect(response.status).toBe(401);
    });

    test('should return users for an authenticated admin user', async () => {
        const accessToken = adminToken;
        
        const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('totalUsers');
        expect(response.body).toHaveProperty('totalPages');
        expect(Array.isArray(response.body.users)).toBe(true);
    });
    test('should return 403 for an authenticated non-admin user', async () => {
        const accessToken = userToken;
        const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(403);
    });
    test('should return paginated users', async () => {
        const accessToken = adminToken;
        
        const response = await request(app)
                .get('/users?page=1&limit=2')
                .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(2);
        expect(response.body.users.length).toBeLessThanOrEqual(2);
    });
    test('should filter users by role', async () => {
        const accessToken = adminToken;

        const response = await request(app)
            .get('/users?role=user')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        response.body.users.forEach(user => {
            expect(user.role).toBe('user');
        });
    });
    test('should search users by name or email', async () => {
        const accessToken = adminToken;

        const response = await request(app)
            .get('/users?search=admin')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        response.body.users.forEach(user =>{
            const matchesName = user.name.toLowerCase().includes('admin');
            const matchesEmail = user.email.toLowerCase().includes('admin');
            expect(matchesName || matchesEmail).toBe(true);
        });
    });
    test('should sort users by name in descending order', async () => {
        const accessToken = adminToken;
        
        const response = await request(app)
            .get('/users?sort=name&order=desc')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        const users = response.body.users;

        for(let i=0; i<users.length-1; i++){
            expect(users[i].name.toLowerCase() >= users[i+1].name.toLowerCase()).toBe(true);
        }
    });
    test('should return 400 for an invalid page number', async () => {
        const accessToken = adminToken;

        const response = await request(app)
            .get('/users?page=-1')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(400);
    });
    test('should return 400 for an invalid limit', async () => {
        const accessToken = adminToken;

        const response = await request(app)
            .get('/users?limit=500')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(400);
    });
    test('should return 400 for an invalid role', async () => {
        const accessToken = adminToken;

        const response = await request(app)
            .get('/users?role=manager')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(400);
    });
    test('should return 400 for an invalid sort field', async () => {
        const accessToken = adminToken;

        const response = await request(app)
            .get('/users?sort=age')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(400);
    });
    test('should create a new user', async () => {
        
        const response = await request(app)
            .post('/users')
            .send({
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test User');
        expect(response.body.email).toContain('test-');
        expect(response.body).toHaveProperty('role');
        expect(response.body).not.toHaveProperty('password');
    });
    test('should return a user by id', async () => {
        
        const createResponse = await request(app)
            .post('/users')
            .send({
                name: 'Get User Test',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        const userId = createResponse.body.id;
        const response = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('role');
        expect(response.body.id).toBe(userId);
        expect(response.body.name).toBe('Get User Test');
        expect(response.body.email).toContain('test-');
        expect(response.body).not.toHaveProperty('password');
    });
    test('should update a user', async () => {
        
        const createResponse = await request(app)
            .post('/users')
            .send({
                name: 'Update test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        const userId = createResponse.body.id;
        const response = await request(app)
            .patch(`/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Updated test'
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('role');
        expect(response.body.id).toBe(userId);
        expect(response.body.name).toBe('Updated test');
        expect(response.body).not.toHaveProperty('password');
    });
    test('should delete a user', async () => {
        
        const createResponse = await request(app)
            .post('/users')
            .send({
                name: 'Delete test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        const userId = createResponse.body.id;
        const response = await request(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('role');
        expect(response.body.user.id).toBe(userId);
        expect(response.body.user.name).toBe('Delete test User');
        expect(response.body.user).not.toHaveProperty('password');
    });
    test('should return 403 when a user tries to update another user', async () => {
        
        const createResponse = await request(app)
            .post('/users')
            .send({
                name: 'Create test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        const targetUserId = createResponse.body.id;

        const response = await request(app)
            .patch(`/users/${targetUserId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Updated test'
            });

        expect(response.status).toBe(403);
    });
    test('should return 403 when a user tries to delete another user', async () => {
        
        const createResponse = await request(app)
            .post('/users')
            .send({
                name: 'Create test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        const targetUserId = createResponse.body.id;

        const response = await request(app)
            .delete(`/users/${targetUserId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(403);
    });
    test('should return 403 when a user tries to access another user', async () => {
        
        const createResponse = await request(app)
            .post('/users')
            .send({
                name: 'Create test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123'
            });
        const targetUserId = createResponse.body.id;

        const response = await request(app)
            .get(`/users/${targetUserId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });
    test('should allow an admin to change another user role', async () => {
        
        const userResponse = await request(app)
            .post('/users')
            .send({
                name: 'Role Test User',
                email: `role-${Date.now()}@example.com`,
                password: 'password123'
            });
        const userId = userResponse.body.id;

        const response = await request(app)
            .patch(`/users/${userId}/role`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                role: 'admin'
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user'); 
        expect(response.body.user).toHaveProperty('id'); 
        expect(response.body.user).toHaveProperty('role'); 
        expect(response.body.user.id).toBe(userId); 
        expect(response.body.user.role).toBe('admin');
    });
    test('should return 403 when a normal user tries to change another user role', async () => {
        
        const targetResponse = await request(app)
            .post('/users')
            .send({
                name: 'Target Role User',
                email: `target-role-${Date.now()}@example.com`,
                password: 'password123'
            });
        expect(targetResponse.status).toBe(201);
        const targetUserId = targetResponse.body.id;

        const response = await request(app)
            .patch(`/users/${targetUserId}/role`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                role: 'admin'
            });
        expect(response.status).toBe(403);
    });
    test('should return 403 when an admin tries to change their own role', async () => {
        
        const decodedToken = jwt.decode(adminToken);
        const adminId = decodedToken.id;

        const response = await request(app)
            .patch(`/users/${adminId}/role`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                role: 'admin'
            });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You cannot change your own role');

    });

    test('should return 400 when an admin tries to assign an invalid role', async () => {
        const targetResponse = await request(app)
            .post('/users')
            .send({
                name: 'Invalid Role Target',
                email: `invalid-role-${Date.now()}@example.com`,
                password: 'password123'
            });
        expect(targetResponse.status).toBe(201);
        const targetUserId = targetResponse.body.id;

        const response = await request(app)
            .patch(`/users/${targetUserId}/role`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                role: 'superadmin' // Invalid role
            });
        expect(response.status).toBe(400);
    });

    test('should return 409 when creating a user with a duplicate email', async () => {
        const email = `duplicate-${Date.now()}@example.com`;
        const firstResponse = await request(app)
            .post('/users')
            .send({
                name: 'Duplicate Test User',
                email: email,
                password: 'password123'
            });
        expect(firstResponse.status).toBe(201);

        const secondResponse = await request(app)
            .post('/users')
            .send({
                name: 'Duplicate Test User 2',
                email: email,
                password: 'password123'
            });
        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.message).toBe('A record with this value already exists');
    });

    test('should return 404 when getting a non-existent user', async () => {
        const response = await request(app)
            .get('/users/999999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 404 when updating a non-existent user', async () => {
        const response = await request(app)
            .patch('/users/999999')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Updated Name'
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 404 when deleting a non-existent user', async () => {
        const response = await request(app)
            .delete('/users/999999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    
});
afterAll(async () => {
    await closePool();
});