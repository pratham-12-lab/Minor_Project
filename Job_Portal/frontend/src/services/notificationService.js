import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://job-portal-backend-7ef9.onrender.com';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/notifications`,
  withCredentials: true,
});

/**
 * Add request interceptor to include auth token
 */
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

/**
 * Add response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if user is actually logged in (has token)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // For guest users, silently reject the promise without logging error
    }
    return Promise.reject(error);
  }
);

/**
 * Notification Service API
 */
const notificationService = {
  /**
   * Get all notifications for current user
   * @param {Object} options - Query options { limit, skip, type, read }
   */
  getNotifications: async ({ 
    limit = 20, 
    skip = 0, 
    type = null, 
    read = null 
  } = {}) => {
    try {
      const params = { limit, skip };
      if (type) params.type = type;
      if (read !== null) params.read = read;

      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Get single notification by ID
   * @param {string} notificationId - Notification ID
   */
  getNotification: async (notificationId) => {
    try {
      const response = await api.get(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.post('/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Clear all notifications
   */
  clearAll: async () => {
    try {
      const response = await api.post('/clear-all');
      return response.data;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  },

  /**
   * Get notifications by type
   * @param {string} type - Notification type
   * @param {Object} options - Query options { limit, skip }
   */
  getByType: async (type, { limit = 20, skip = 0 } = {}) => {
    try {
      const response = await api.get('/', {
        params: { type, limit, skip },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications only
   * @param {Object} options - Query options { limit, skip }
   */
  getUnread: async ({ limit = 20, skip = 0 } = {}) => {
    try {
      const response = await api.get('/', {
        params: { limit, skip, read: false },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },
};

export default notificationService;
