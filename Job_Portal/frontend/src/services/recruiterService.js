import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://job-portal-backend-7ef9.onrender.com/api';
const api = axios.create({
  baseURL: `${API_BASE_URL}/recruiter`,
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

const recruiterService = {
  // Get dashboard analytics
  getDashboard: async (timeframe = '30') => {
    try {
      const response = await api.get(`/dashboard?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  // Search candidates
  searchCandidates: async (filters = {}) => {
    try {
      const response = await api.get('/candidates/search', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error searching candidates:', error);
      throw error;
    }
  },

  // Bulk update applications
  bulkUpdateApplications: async (applicationIds, action, data = {}) => {
    try {
      const response = await api.post('/applications/bulk-update', {
        applicationIds,
        action,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating applications:', error);
      throw error;
    }
  },

  // Save candidate
  saveCandidate: async (candidateId, notes = '', tags = []) => {
    try {
      const response = await api.post(`/candidates/${candidateId}/save`, {
        notes,
        tags
      });
      return response.data;
    } catch (error) {
      console.error('Error saving candidate:', error);
      throw error;
    }
  },

  // Get saved candidates
  getSavedCandidates: async (params = {}) => {
    try {
      const response = await api.get('/candidates/saved', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved candidates:', error);
      throw error;
    }
  },
};

export default recruiterService;