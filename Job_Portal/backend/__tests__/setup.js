// Test setup and teardown configuration
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Setup in-memory MongoDB for testing
 */
export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

/**
 * Clean up test database
 */
export const cleanupTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Clear all collections in test database
 */
export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Mock environment variables for testing
 */
export const setupTestEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '8001';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_EXPIRY = '1h';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-api-key';
  process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
  process.env.SMTP_HOST = 'smtp.test.com';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'test@test.com';
  process.env.SMTP_PASS = 'test-password';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.CHATBOT_PROVIDER = 'openai';
  process.env.APP_NAME = 'Job-Portal-Test';
};

/**
 * Reset environment variables after tests
 */
export const resetTestEnv = () => {
  delete process.env.NODE_ENV;
  delete process.env.PORT;
  delete process.env.JWT_SECRET;
  delete process.env.JWT_EXPIRY;
  delete process.env.FRONTEND_URL;
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.OPENAI_API_KEY;
  delete process.env.CHATBOT_PROVIDER;
  delete process.env.APP_NAME;
};

/**
 * Generate test user data
 */
export const generateTestUser = (role = 'student') => ({
  fullname: 'Test User',
  email: `test-${Date.now()}@test.com`,
  phoneNumber: 1234567890,
  password: 'TestPassword123!',
  role,
  companyName: role === 'recruiter' ? 'Test Company' : '',
  companyWebsite: role === 'recruiter' ? 'https://test.com' : '',
});

/**
 * Generate test job data
 */
export const generateTestJob = (companyId) => ({
  title: 'Software Developer',
  description: 'Test job description',
  requirements: 'JavaScript, Node.js, React',
  salary: 80000,
  location: 'Remote',
  jobType: 'Full-time',
  experience: 'Mid-level',
  position: 'Software Engineer',
  companyId,
});

/**
 * Mock file object for testing uploads
 */
export const mockFile = () => ({
  buffer: Buffer.from('test file content'),
  originalname: 'test.png',
  mimetype: 'image/png',
  size: 1024,
});

/**
 * Mock PDF file for resume testing
 */
export const mockPdfFile = () => ({
  buffer: Buffer.from('%PDF-1.4 test pdf content'),
  originalname: 'resume.pdf',
  mimetype: 'application/pdf',
  size: 2048,
});

/**
 * Wait helper for async operations
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Global test configuration
 */
export const testConfig = {
  timeout: 10000,
  retries: 2,
};