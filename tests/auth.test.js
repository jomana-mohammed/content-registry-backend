const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

// Test database connection string
const TEST_MONGODB_URI = 'mongodb://localhost:27017/content-registry-test';

// Connect to test database before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI);
  }
  
  console.log('🧪 Test database connected');
}, 30000); // 30 second timeout

// Clear database before each test
beforeEach(async () => {
  await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log('🧪 Test database closed');
}, 30000);

// ===== AUTHENTICATION TESTS =====

describe('Authentication API', () => {
  
  // Test 1: User Registration
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test123@example.com',
        password: 'password123',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        username: 'user1'
      };
      await request(app).post('/api/auth/register').send(userData);

      const duplicateUser = {
        email: 'duplicate@example.com',
        password: 'password456',
        username: 'user2'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalidemail',
        password: 'password123',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Test 2: User Login
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          username: 'loginuser'
        });
    });

    it('should login with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should not login with wrong password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid Password');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Test 3: Get Current User (Protected Route)
  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'me@example.com',
          password: 'password123',
          username: 'meuser'
        });
      authToken = response.body.token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('me@example.com');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});