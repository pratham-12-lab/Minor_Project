# Testing Guide - Job Portal

## 📋 Overview

This document outlines the complete testing strategy for the Job Portal API, including unit tests, integration tests, security tests, and performance tests.

## 🧪 Test Structure

```
__tests__/
├── setup.js                    # Test configuration & database setup
├── test-utils.js               # Test utilities and helpers
├── global-setup.js             # Global setup (runs once before all tests)
├── global-teardown.js          # Global teardown (runs once after all tests)
├── jest.config.js              # Jest configuration
│
├── unit/                        # Unit tests (individual functions)
│   ├── validators.test.js
│   ├── sanitizers.test.js
│   └── helpers.test.js
│
├── integration/                 # Integration tests (API endpoints)
│   ├── auth.test.js
│   ├── jobs.test.js
│   ├── applications.test.js
│   └── chatbot.test.js
│
├── security/                    # Security tests
│   ├── authentication.test.js
│   ├── authorization.test.js
│   ├── validation.test.js
│   └── xss-protection.test.js
│
├── performance/                 # Performance tests
│   ├── load.test.js
│   └── response-times.test.js
│
└── fixtures/                    # Test data
    ├── users.json
    ├── jobs.json
    └── applications.json
```

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- auth.test.js
npm test -- __tests__/integration/
npm test -- __tests__/security/
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm test -- --coverage
```

### Generate HTML Coverage Report
```bash
npm test -- --coverage --collectCoverageFrom='controllers/**/*.js' --collectCoverageFrom='utils/**/*.js'
```

## 📊 Test Categories

### 1. Unit Tests (40% coverage)
Test individual functions and modules in isolation.

**Files:**
- `validators.test.js` - Input validation schemas
- `sanitizers.test.js` - Data sanitization functions
- `helpers.test.js` - Utility functions

**Example:**
```javascript
describe('Input Validators', () => {
  test('should validate email format', () => {
    const email = 'test@example.com';
    const { error } = validateEmail(email);
    expect(error).toBeUndefined();
  });
});
```

### 2. Integration Tests (35% coverage)
Test API endpoints with realistic data flows.

**Files:**
- `auth.test.js` - Authentication endpoints
- `jobs.test.js` - Job management endpoints
- `applications.test.js` - Application endpoints
- `chatbot.test.js` - AI chatbot endpoints

**Coverage:**
- User registration and login
- Job CRUD operations
- Application submission and status updates
- Chatbot interactions

### 3. Security Tests (20% coverage)
Test authentication, authorization, and input validation.

**Files:**
- `authentication.test.js` - JWT validation
- `authorization.test.js` - Role-based access control
- `validation.test.js` - Input validation
- `xss-protection.test.js` - XSS attack prevention

**Scenarios Tested:**
- Invalid tokens
- Expired tokens
- Unauthorized access attempts
- SQL/NoSQL injection attempts
- XSS payload attempts
- Rate limiting

### 4. Performance Tests (5% coverage)
Test response times and load handling.

**Files:**
- `load.test.js` - Concurrent request handling
- `response-times.test.js` - Response time benchmarks

**Targets:**
- Response time < 200ms for most endpoints
- Support concurrent users (100+)
- Database query optimization

## 🔧 Running Tests

### Development Mode
```bash
npm run test:watch
```

### CI/CD Mode
```bash
npm run ci:test
```

### Coverage Check
```bash
npm test -- --coverage --collectCoverageFrom='**/*.js' --collectCoverageFrom='!**/node_modules/**' --collectCoverageFrom='!**/__tests__/**'
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📈 Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Overall | 80% | (pending) |
| Statements | 80% | (pending) |
| Branches | 75% | (pending) |
| Functions | 80% | (pending) |
| Lines | 80% | (pending) |
| Security Tests | 100% | (pending) |
| Integration Tests | 95% | (pending) |

## 🔍 Test Best Practices

### 1. Test Organization
- One test file per module/endpoint
- Descriptive test names
- Logical grouping with `describe()`

### 2. Test Data
- Use factory functions for test data
- Mock external dependencies
- Clean up data after each test

### 3. Assertions
- Test one thing per test
- Use descriptive assertion messages
- Test both success and failure cases

### 4. Performance
- Minimize database hits
- Use in-memory database for tests
- Mock external services

### 5. Maintenance
- Keep tests simple and readable
- Update tests with code changes
- Remove obsolete tests
- Refactor duplicated test code

## 🛡️ Security Test Checklist

- [ ] Invalid token rejection
- [ ] Expired token handling
- [ ] Unauthorized access prevention
- [ ] SQL injection protection
- [ ] NoSQL injection protection
- [ ] XSS attack prevention
- [ ] CSRF protection
- [ ] Rate limiting enforcement
- [ ] File upload validation
- [ ] Input sanitization

## 📝 Writing New Tests

### Template: Integration Test

```javascript
import request from 'supertest';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../index.js';
import { setupTestDB, cleanupTestDB, clearCollections } from './setup.js';
import { createTestUser, generateTestToken } from './test-utils.js';

describe('Feature Name', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  test('should do something when conditions are met', async () => {
    // Arrange - Set up test data
    const user = await createTestUser();
    const token = generateTestToken(user._id);

    // Act - Execute the test
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Assert - Verify the result
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  test('should fail when conditions are not met', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('error');
  });
});
```

### Template: Security Test

```javascript
describe('Security: Authorization', () => {
  test('should deny access to unauthorized users', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Forbidden');
  });

  test('should prevent SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: maliciousInput,
        password: 'password'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

## 🐛 Debugging Tests

### Run Single Test File
```bash
npm test -- auth.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should reject invalid token"
```

### Debug with Chrome DevTools
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```
Then open `chrome://inspect`

### Verbose Output
```bash
npm test -- --verbose
```

## 📊 CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Commits to main branch
- Scheduled nightly runs

### Coverage Reports
- Generated after each test run
- Available in `coverage/` directory
- LCOV format for CI integration

## 🚨 Common Issues

### Tests Timeout
- Increase `testTimeout` in jest.config.js
- Check for unresolved promises
- Verify async/await usage

### Database Connection Issues
- Check `setupTestDB()` in setup.js
- Verify MongoDB Memory Server is installed
- Check network connectivity

### Module Not Found Errors
- Verify imports use correct paths
- Check `moduleNameMapper` in jest.config.js
- Clear node_modules cache

### Tests Pass Locally but Fail in CI
- Check Node.js version differences
- Verify environment variables
- Check timezone settings

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Best Practices](https://testingjavascript.com/)

---

**Last Updated:** January 2024  
**Test Runner:** Jest 29.7.0  
**Test Coverage:** Target 80%+