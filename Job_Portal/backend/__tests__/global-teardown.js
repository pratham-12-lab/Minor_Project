// Global teardown for all tests
import { resetTestEnv } from './setup.js';

export default async () => {
  console.log('🧹 Global test teardown starting...');
  
  // Reset environment variables
  resetTestEnv();
  
  // Clear any remaining timeouts or intervals
  const maxTimerId = setTimeout(() => {}, 0);
  for (let i = 0; i < maxTimerId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
  
  console.log('✅ Global test teardown complete');
};