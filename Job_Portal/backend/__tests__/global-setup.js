// Global setup for all tests
import { setupTestEnv } from './setup.js';

export default async () => {
  console.log('🚀 Global test setup starting...');
  
  // Setup test environment variables
  setupTestEnv();
  
  // Ensure NODE_ENV is test
  process.env.NODE_ENV = 'test';
  
  console.log('✅ Global test setup complete');
};