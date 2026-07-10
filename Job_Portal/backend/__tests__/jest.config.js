// Jest configuration for ES modules with Node test environment
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/coverage/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/setup.js',
    '/__tests__/test-utils.js',
    '/__tests__/global-setup.js',
    '/__tests__/global-teardown.js',
    '/__tests__/jest.config.js',
  ],
  testTimeout: 30000,
  verbose: true,
  silent: false,
  detectOpenHandles: false,
  forceExit: true,
  maxWorkers: 1,
};