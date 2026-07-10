// Test utilities and helpers
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import { Company } from '../models/company.model.js';

/**
 * Create test user with hashed password
 */
export const createTestUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = new User({
    ...userData,
    password: hashedPassword,
    isVerified: true,
    verificationStatus: 'approved',
  });
  await user.save();
  return user;
};

/**
 * Generate JWT token for test user
 */
export const generateTestToken = (userId, role = 'student') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );
};

/**
 * Create authenticated test request
 */
export const createAuthenticatedRequest = (userId, role = 'student') => {
  const token = generateTestToken(userId, role);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cookies: {
      token,
    },
  };
};

/**
 * Create test company
 */
export const createTestCompany = async (ownerId, companyData = {}) => {
  const company = new Company({
    name: companyData.name || 'Test Company',
    description: companyData.description || 'Test company description',
    website: companyData.website || 'https://test.com',
    industry: companyData.industry || 'Technology',
    size: companyData.size || '51-200',
    location: companyData.location || 'San Francisco, CA',
    logoUrl: companyData.logoUrl || 'https://test.com/logo.png',
    owner: ownerId,
    ...companyData,
  });
  await company.save();
  return company;
};

/**
 * Create test job
 */
export const createTestJob = async (companyId, jobData = {}) => {
  const job = new Job({
    title: jobData.title || 'Software Developer',
    description: jobData.description || 'Test job description',
    requirements: jobData.requirements || ['JavaScript', 'Node.js', 'React'],
    salary: jobData.salary || 80000,
    location: jobData.location || 'Remote',
    jobType: jobData.jobType || 'Full-time',
    experienceLevel: jobData.experienceLevel || 'Mid-level',
    position: jobData.position || 'Software Engineer',
    company: companyId,
    status: jobData.status || 'active',
    ...jobData,
  });
  await job.save();
  return job;
};

/**
 * Create multiple test jobs
 */
export const createTestJobs = async (companyId, count = 5) => {
  const jobs = [];
  const positions = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist'];
  
  for (let i = 0; i < count; i++) {
    const job = await createTestJob(companyId, {
      title: positions[i % positions.length],
      salary: 60000 + (i * 10000),
      location: i % 2 === 0 ? 'Remote' : 'New York, NY',
    });
    jobs.push(job);
  }
  
  return jobs;
};

/**
 * Assert response structure for common API responses
 */
export const assertApiResponse = (response, success = true) => {
  expect(response.body).toHaveProperty('success', success);
  expect(response.body).toHaveProperty('message');
  
  if (success) {
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  } else {
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  }
};

/**
 * Assert error response structure
 */
export const assertErrorResponse = (response, statusCode = 400) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toBeDefined();
};

/**
 * Assert pagination response structure
 */
export const assertPaginationResponse = (response, expectedCount = 10) => {
  assertApiResponse(response, true);
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toHaveProperty('items');
  expect(response.body.data).toHaveProperty('total');
  expect(response.body.data).toHaveProperty('page');
  expect(response.body.data).toHaveProperty('limit');
  expect(response.body.data).toHaveProperty('totalPages');
  expect(Array.isArray(response.body.data.items)).toBe(true);
  expect(response.body.data.items.length).toBeLessThanOrEqual(expectedCount);
};

/**
 * Mock external service responses
 */
export const mockExternalServices = () => {
  // Mock Cloudinary
  jest.mock('../utils/cloudinary.js', () => ({
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://cloudinary.com/test-image.png',
        public_id: 'test-public-id',
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  }));

  // Mock email service
  jest.mock('../services/emailService.js', () => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendJobAlertEmail: jest.fn().mockResolvedValue(true),
    sendApplicationStatusEmail: jest.fn().mockResolvedValue(true),
  }));

  // Mock OpenAI service
  jest.mock('openai', () => ({
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mock OpenAI response'
              }
            }]
          })
        }
      }
    }))
  }));
};

/**
 * Clean up mocks after each test
 */
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

/**
 * Test data factory for creating consistent test data
 */
export const TestDataFactory = {
  createUser: (overrides = {}) => ({
    fullname: 'Test User',
    email: `test-${Date.now()}@test.com`,
    phoneNumber: 1234567890,
    password: 'TestPassword123!',
    role: 'student',
    companyName: '',
    companyWebsite: '',
    ...overrides,
  }),
  
  createCompany: (overrides = {}) => ({
    name: 'Test Company',
    description: 'Test company description',
    website: 'https://test.com',
    industry: 'Technology',
    size: '51-200',
    location: 'San Francisco, CA',
    logoUrl: 'https://test.com/logo.png',
    ...overrides,
  }),
  
  createJob: (overrides = {}) => ({
    title: 'Software Developer',
    description: 'Test job description',
    requirements: 'JavaScript, Node.js, React',
    salary: 80000,
    location: 'Remote',
    jobType: 'Full-time',
    experience: 'Mid-level',
    position: 'Software Engineer',
    ...overrides,
  }),
};