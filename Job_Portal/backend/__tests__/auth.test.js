// Authentication tests
import request from 'supertest';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../index.js';
import { 
  setupTestDB, 
  cleanupTestDB, 
  clearCollections,
  generateTestUser,
  setupTestEnv 
} from './setup.js';
import { 
  createTestUser, 
  generateTestToken,
  TestDataFactory 
} from './test-utils.js';
import { User } from '../models/user.model.js';

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    setupTestEnv();
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe('POST /api/users/register', () => {
    test('should register a new student user successfully', async () => {
      const userData = TestDataFactory.createUser({
        email: 'student@test.com',
        role: 'student',
      });

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('student');
      expect(response.body.user.isVerified).toBe(false);
      expect(response.body.token).toBeDefined();
    });

    test('should register a new recruiter user successfully', async () => {
      const userData = TestDataFactory.createUser({
        email: 'recruiter@test.com',
        role: 'recruiter',
        companyName: 'Test Company Inc.',
        companyWebsite: 'https://testcompany.com',
      });

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('recruiter');
      expect(response.body.user.companyName).toBe('Test Company Inc.');
      expect(response.body.user.verificationStatus).toBe('pending');
    });

    test('should fail registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          fullname: 'Test User',
          email: 'test@test.com',
          // Missing phoneNumber, password, role
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should fail registration with invalid role', async () => {
      const userData = TestDataFactory.createUser({
        email: 'invalid@test.com',
        role: 'invalid-role',
      });

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid role');
    });

    test('should fail registration with existing email', async () => {
      const userData = TestDataFactory.createUser({
        email: 'existing@test.com',
      });

      // First registration
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should require company name for recruiter role', async () => {
      const userData = TestDataFactory.createUser({
        email: 'recruiter-no-company@test.com',
        role: 'recruiter',
        companyName: '', // Empty company name
      });

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Company name is required');
    });
  });

  describe('POST /api/users/login', () => {
    let testUser;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'login@test.com',
        password,
        role: 'student',
      });
    });

    test('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@test.com',
          password: password,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login@test.com');
      expect(response.body.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should fail login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'SomePassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          // Missing email and password
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/users/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/users/logout')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
      expect(response.headers['set-cookie']).toBeDefined();
      
      // Check if cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies.some(cookie => cookie.includes('token=;'))).toBe(true);
    });
  });

  describe('GET /api/users/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'profile@test.com',
        role: 'student',
      });
      authToken = generateTestToken(testUser._id, 'student');
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('profile@test.com');
      expect(response.body.user.password).toBeUndefined(); // Password should not be exposed
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('PUT /api/users/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'update@test.com',
        role: 'student',
        fullname: 'Original Name',
        phoneNumber: 1234567890,
      });
      authToken = generateTestToken(testUser._id, 'student');
    });

    test('should update user profile successfully', async () => {
      const updates = {
        fullname: 'Updated Name',
        phoneNumber: 9876543210,
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Profile updated');
      expect(response.body.user.fullname).toBe('Updated Name');
      expect(response.body.user.phoneNumber).toBe(9876543210);
    });

    test('should fail update with invalid data', async () => {
      const updates = {
        phoneNumber: 'not-a-number', // Invalid phone number
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should not allow role change via profile update', async () => {
      const updates = {
        role: 'admin', // Should not be allowed
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      // Role should remain unchanged
      expect(response.body.user.role).toBe('student');
    });
  });

  describe('POST /api/users/change-password', () => {
    let testUser;
    let authToken;
    const oldPassword = 'OldPassword123!';
    const newPassword = 'NewPassword123!';

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'password@test.com',
        password: oldPassword,
        role: 'student',
      });
      authToken = generateTestToken(testUser._id, 'student');
    });

    test('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: oldPassword,
          newPassword: newPassword,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'password@test.com',
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should fail with incorrect old password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongOldPassword123!',
          newPassword: newPassword,
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid old password');
    });

    test('should fail with weak new password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: oldPassword,
          newPassword: 'weak', // Too weak
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password must be');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .send({
          oldPassword: oldPassword,
          newPassword: newPassword,
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Verification and Admin Approval', () => {
    let adminUser;
    let recruiterUser;
    let adminToken;

    beforeEach(async () => {
      // Create admin user
      adminUser = await createTestUser({
        email: 'admin@test.com',
        role: 'admin',
      });

      // Create unverified recruiter
      recruiterUser = new User({
        email: 'recruiter-pending@test.com',
        fullname: 'Pending Recruiter',
        phoneNumber: 1234567890,
        password: await bcrypt.hash('Password123!', 10),
        role: 'recruiter',
        companyName: 'Pending Company',
        companyWebsite: 'https://pending.com',
        isVerified: false,
        verificationStatus: 'pending',
      });
      await recruiterUser.save();

      adminToken = generateTestToken(adminUser._id, 'admin');
    });

    test('should get pending verifications (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/pending-verifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      const pendingUser = response.body.users.find(
        user => user.email === 'recruiter-pending@test.com'
      );
      expect(pendingUser).toBeDefined();
      expect(pendingUser.verificationStatus).toBe('pending');
    });

    test('should fail get pending verifications for non-admin', async () => {
      const studentToken = generateTestToken('some-student-id', 'student');
      
      const response = await request(app)
        .get('/api/admin/pending-verifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Forbidden');
    });
  });
});