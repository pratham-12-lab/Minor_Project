import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/profile-views`,
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

const profileViewService = {
  // Track profile view
  trackView: async (profileId, viewData = {}) => {
    try {
      const response = await api.post(`/track/${profileId}`, viewData);
      return response.data;
    } catch (error) {
      console.error('Error tracking profile view:', error);
      throw error;
    }
  },

  // Get who viewed my profile
  getMyViews: async (params = {}) => {
    try {
      const response = await api.get('/my-views', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile views:', error);
      throw error;
    }
  },

  // Get profiles I visited
  getMyVisits: async (params = {}) => {
    try {
      const response = await api.get('/my-visits', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my visits:', error);
      throw error;
    }
  },

  // Add fake views for demo
  addFakeViews: async (count = 5) => {
    try {
      const response = await api.post('/fake-views', { count });
      return response.data;
    } catch (error) {
      console.error('Error adding fake views:', error);
      throw error;
    }
  },

  // Clear all profile views
  clearAllViews: async () => {
    try {
      const response = await api.delete('/clear-all');
      return response.data;
    } catch (error) {
      console.error('Error clearing views:', error);
      throw error;
    }
  },
};

export default profileViewService;