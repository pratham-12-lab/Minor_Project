// Job Management Tests
import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import app from '../index.js';
import { 
  setupTestDB, 
  cleanupTestDB, 
  clearCollections,
  setupTestEnv 
} from './setup.js';
import { 
  createTestUser,
  createTestCompany,
  createTestJob,
  createTestJobs,
  generateTestToken,
  assertPaginationResponse,
  TestDataFactory
} from './test-utils.js';

describe('Job Management API Tests', () => {
  let recruiterUser;
  let studentUser;
  let company;
  let recruiterToken;
  let studentToken;

  beforeAll(async () => {
    setupTestEnv();
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    // Create test users
    recruiterUser = await createTestUser({
      email: 'recruiter@test.com',
      role: 'recruiter',
      companyName: 'Tech Corp',
    });
    recruiterToken = generateTestToken(recruiterUser._id, 'recruiter');

    studentUser = await createTestUser({
      email: 'student@test.com',
      role: 'student',
    });
    studentToken = generateTestToken(studentUser._id, 'student');

    // Create test company
    company = await createTestCompany(recruiterUser._id, {
      name: 'Tech Corp',
      description: 'Leading tech company',
    });
  });

  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      // Create test jobs
      await createTestJobs(company._id, 5);
    });

    test('should retrieve all jobs with pagination', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect('Content-Type', /json/)
        .expect(200);

      assertPaginationResponse(response);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    test('should filter jobs by location', async () => {
      const response = await request(app)
        .get('/api/jobs?location=Remote')
        .expect(200);

      assertPaginationResponse(response);
      
      response.body.data.items.forEach(job => {
        expect(job.location).toBe('Remote');
      });
    });

    test('should filter jobs by job type', async () => {
      const response = await request(app)
        .get('/api/jobs?jobType=Full-time')
        .expect(200);

      assertPaginationResponse(response);
      
      response.body.data.items.forEach(job => {
        expect(job.jobType).toBe('Full-time');
      });
    });

    test('should filter jobs by salary range', async () => {
      const response = await request(app)
        .get('/api/jobs?minSalary=60000&maxSalary=100000')
        .expect(200);

      assertPaginationResponse(response);
      
      response.body.data.items.forEach(job => {
        expect(job.salary).toBeGreaterThanOrEqual(60000);
        expect(job.salary).toBeLessThanOrEqual(100000);
      });
    });

    test('should search jobs by title', async () => {
      const response = await request(app)
        .get('/api/jobs?search=Developer')
        .expect(200);

      assertPaginationResponse(response);
      
      response.body.data.items.forEach(job => {
        expect(job.title.toLowerCase()).toContain('developer');
      });
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/jobs?page=1&limit=2')
        .expect(200);

      assertPaginationResponse(response, 2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
    });

    test('should return empty list when no jobs match filters', async () => {
      const response = await request(app)
        .get('/api/jobs?location=Mars')
        .expect(200);

      expect(response.body.data.items.length).toBe(0);
      expect(response.body.data.total).toBe(0);
    });

    test('should sort jobs by date (newest first)', async () => {
      const response = await request(app)
        .get('/api/jobs?sort=date&order=desc')
        .expect(200);

      assertPaginationResponse(response);
      
      // Verify descending order
      for (let i = 1; i < response.body.data.items.length; i++) {
        const prevDate = new Date(response.body.data.items[i - 1].createdAt);
        const currDate = new Date(response.body.data.items[i].createdAt);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });

    test('should sort jobs by salary (highest first)', async () => {
      const response = await request(app)
        .get('/api/jobs?sort=salary&order=desc')
        .expect(200);

      assertPaginationResponse(response);
      
      // Verify descending order
      for (let i = 1; i < response.body.data.items.length; i++) {
        expect(response.body.data.items[i - 1].salary).toBeGreaterThanOrEqual(
          response.body.data.items[i].salary
        );
      }
    });
  });

  describe('GET /api/jobs/:id', () => {
    let job;

    beforeEach(async () => {
      job = await createTestJob(company._id);
    });

    test('should retrieve job by ID', async () => {
      const response = await request(app)
        .get(`/api/jobs/${job._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job).toBeDefined();
      expect(response.body.job.id).toBe(job._id.toString());
      expect(response.body.job.title).toBe(job.title);
    });

    test('should include company details in response', async () => {
      const response = await request(app)
        .get(`/api/jobs/${job._id}`)
        .expect(200);

      expect(response.body.job.company).toBeDefined();
      expect(response.body.job.company.name).toBe(company.name);
    });

    test('should return 404 for non-existent job', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/jobs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return 400 for invalid job ID format', async () => {
      const response = await request(app)
        .get('/api/jobs/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/jobs (Create Job)', () => {
    test('should create job for recruiter', async () => {
      const jobData = TestDataFactory.createJob({
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(jobData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully');
      expect(response.body.job).toBeDefined();
      expect(response.body.job.title).toBe(jobData.title);
    });

    test('should fail if student tries to create job', async () => {
      const jobData = TestDataFactory.createJob({
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(jobData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Forbidden');
    });

    test('should fail without authentication token', async () => {
      const jobData = TestDataFactory.createJob({
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should validate required fields', async () => {
      const incompleteJob = {
        title: 'Developer', // Missing other required fields
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(incompleteJob)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should validate job title length', async () => {
      const jobData = TestDataFactory.createJob({
        title: 'A', // Too short
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate salary is positive number', async () => {
      const jobData = TestDataFactory.createJob({
        salary: -50000, // Negative salary
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate job type enum', async () => {
      const jobData = TestDataFactory.createJob({
        jobType: 'InvalidType',
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate experience level enum', async () => {
      const jobData = TestDataFactory.createJob({
        experience: 'InvalidLevel',
        companyId: company._id.toString(),
      });

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/jobs/:id (Update Job)', () => {
    let job;

    beforeEach(async () => {
      job = await createTestJob(company._id);
    });

    test('should update job for recruiter', async () => {
      const updatedData = {
        title: 'Updated Job Title',
        salary: 95000,
      };

      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job.title).toBe('Updated Job Title');
      expect(response.body.job.salary).toBe(95000);
    });

    test('should fail if non-owner tries to update', async () => {
      const otherRecruiter = await createTestUser({
        email: 'other@recruiter.com',
        role: 'recruiter',
        companyName: 'Other Corp',
      });
      const otherToken = generateTestToken(otherRecruiter._id, 'recruiter');

      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    let job;

    beforeEach(async () => {
      job = await createTestJob(company._id);
    });

    test('should delete job for recruiter owner', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify job is deleted
      const getResponse = await request(app)
        .get(`/api/jobs/${job._id}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    test('should fail if non-owner tries to delete', async () => {
      const otherRecruiter = await createTestUser({
        email: 'other@recruiter.com',
        role: 'recruiter',
        companyName: 'Other Corp',
      });
      const otherToken = generateTestToken(otherRecruiter._id, 'recruiter');

      const response = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Job Alerts', () => {
    test('should create job alert for student', async () => {
      const alertData = {
        keywords: 'JavaScript,React',
        location: 'Remote',
        jobType: 'Full-time',
        minSalary: 60000,
        frequency: 'daily',
      };

      const response = await request(app)
        .post('/api/job-alerts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(alertData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.alert).toBeDefined();
      expect(response.body.alert.isActive).toBe(true);
    });

    test('should get user job alerts', async () => {
      // Create alert first
      await request(app)
        .post('/api/job-alerts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          keywords: 'Developer',
          location: 'Remote',
          frequency: 'daily',
        });

      const response = await request(app)
        .get('/api/job-alerts')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.alerts)).toBe(true);
      expect(response.body.alerts.length).toBeGreaterThan(0);
    });

    test('should delete job alert', async () => {
      // Create alert first
      const createResponse = await request(app)
        .post('/api/job-alerts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          keywords: 'Developer',
          location: 'Remote',
          frequency: 'daily',
        });

      const alertId = createResponse.body.alert.id;

      // Delete alert
      const deleteResponse = await request(app)
        .delete(`/api/job-alerts/${alertId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });
});