import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://job-portal-backend-7ef9.onrender.com/api';
const api = axios.create({
  baseURL: `${API_BASE_URL}/saved-jobs`,
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

const savedJobService = {
  // Save a job
  saveJob: async (jobId) => {
    try {
      const response = await api.post(`/save/${jobId}`, {});
      return response.data;
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  },

  // Unsave a job
  unsaveJob: async (jobId) => {
    try {
      const response = await api.delete(`/unsave/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  },

  // Get all saved jobs
  getSavedJobs: async () => {
    try {
      const response = await api.get('/get');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      throw error;
    }
  },

  // Check if a job is saved
  checkJobSaved: async (jobId) => {
    try {
      const response = await api.get(`/check/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      throw error;
    }
  },
};

export default savedJobService;
