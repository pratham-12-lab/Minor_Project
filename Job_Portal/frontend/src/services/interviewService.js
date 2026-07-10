import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/interviews`,
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const interviewService = {
  // Schedule interview
  scheduleInterview: async (applicationId, interviewData) => {
    try {
      const response = await api.post(`/schedule/${applicationId}`, interviewData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  },

  // Get recruiter interviews
  getRecruiterInterviews: async (params = {}) => {
    try {
      const response = await api.get('/recruiter', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter interviews:', error);
      throw error;
    }
  },

  // Get candidate interviews
  getCandidateInterviews: async (params = {}) => {
    try {
      const response = await api.get('/candidate', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate interviews:', error);
      throw error;
    }
  },

  // Confirm interview
  confirmInterview: async (interviewId) => {
    try {
      const response = await api.put(`/${interviewId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming interview:', error);
      throw error;
    }
  },

  // Submit feedback
  submitFeedback: async (interviewId, feedback) => {
    try {
      const response = await api.put(`/${interviewId}/feedback`, { feedback });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Reschedule interview
  rescheduleInterview: async (interviewId, newDate, reason) => {
    try {
      const response = await api.put(`/${interviewId}/reschedule`, { 
        newDate, 
        reason 
      });
      return response.data;
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      throw error;
    }
  },

  // Cancel interview
  cancelInterview: async (interviewId, reason) => {
    try {
      const response = await api.put(`/${interviewId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling interview:', error);
      throw error;
    }
  },
};

export default interviewService;