const request = require('supertest');
const app = require('../../src/index');
const { getDB } = require('../../src/config/db');
const jwt = require('jsonwebtoken');

describe('Authentication API', () => {
  let db;
  
  beforeAll(async () => {
    db = await getDB();
  });
  
  beforeEach(async () => {
    // Clean up users table before each test
    await db.query('DELETE FROM users');
  });
  
  afterAll(async () => {
    await db.end();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+447123456789',
        address: '123 Test Street, London'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify user was saved to database
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [userData.email]);
      expect(rows.length).toBe(1);
    });
    
    it('should not register a user with an existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
        phone: '+447123456789',
        address: '123 Test Street, London'
      };
      
      // First registration should succeed
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Second registration with same email should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        name: 'Login Test User',
        email: 'login@example.com',
        password: '$2a$10$XbGnvQSTZU7m7SQIQkVRkehITVVCJVhFEwNzFHQGfQiOWvRgRdiUy', // bcrypt hash for 'password123'
        phone: '+447123456789',
        address: '123 Test Street, London'
      };
      
      await db.query(
        'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.phone, userData.address]
      );
    });
    
    it('should login with valid credentials and return token', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      
      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', loginData.email);
    });
    
    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
});

