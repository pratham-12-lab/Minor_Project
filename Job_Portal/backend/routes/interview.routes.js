import express from 'express';
import {
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  confirmInterview,
  submitInterviewFeedback,
  rescheduleInterview,
  cancelInterview
} from '../controllers/interview.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Schedule interview for an application
router.post('/schedule/:applicationId', isAuthenticated, scheduleInterview);

// Get interviews for recruiter
router.get('/recruiter', isAuthenticated, getRecruiterInterviews);

// Get interviews for candidate
router.get('/candidate', isAuthenticated, getCandidateInterviews);

// Confirm interview (by candidate)
router.put('/:interviewId/confirm', isAuthenticated, confirmInterview);

// Submit interview feedback (by recruiter)
router.put('/:interviewId/feedback', isAuthenticated, submitInterviewFeedback);

// Reschedule interview
router.put('/:interviewId/reschedule', isAuthenticated, rescheduleInterview);

// Cancel interview
router.put('/:interviewId/cancel', isAuthenticated, cancelInterview);

export default router;