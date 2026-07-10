import express from 'express';
import {
  getRecruiterDashboard,
  searchCandidates,
  bulkUpdateApplications,
  saveCandidate,
  getSavedCandidates
} from '../controllers/recruiter.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Recruiter dashboard with analytics
router.get('/dashboard', isAuthenticated, getRecruiterDashboard);

// Advanced candidate search
router.get('/candidates/search', isAuthenticated, searchCandidates);

// Bulk update applications
router.post('/applications/bulk-update', isAuthenticated, bulkUpdateApplications);

// Save candidate for future
router.post('/candidates/:candidateId/save', isAuthenticated, saveCandidate);

// Get saved candidates
router.get('/candidates/saved', isAuthenticated, getSavedCandidates);

export default router;