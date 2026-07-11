import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://job-portal-backend-7ef9.onrender.com';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/messages`,
  withCredentials: true,
});

/**
 * Add request interceptor to ensure credentials are included
 */
api.interceptors.request.use(
  (config) => {
    // Ensure cookies are sent with each request
    config.withCredentials = true;
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
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Chat Service API
 */
const chatService = {
  /**
   * Get messages for a chat room
   * @param {string} roomId - Room ID
   * @param {Object} options - Query options { limit, skip }
   */
  getMessages: async (roomId, { limit = 50, skip = 0 } = {}) => {
    try {
      const response = await api.get(`/${roomId}`, {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a message
   * @param {Object} messageData - Message object
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Edit a message
   * @param {string} messageId - Message ID
   * @param {Object} updateData - Updated message data
   */
  editMessage: async (messageId, updateData) => {
    try {
      const response = await api.put(`/${messageId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  /**
   * Search messages in a room
   * @param {string} roomId - Room ID
   * @param {string} query - Search query
   */
  searchMessages: async (roomId, query) => {
    try {
      const response = await api.get(`/${roomId}/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param {string} roomId - Room ID
   * @param {Array} messageIds - Message IDs to mark as read
   */
  markAsRead: async (roomId, messageIds) => {
    try {
      const response = await api.post(`/${roomId}/mark-read`, { messageIds });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  /**
   * Get unread message count for a room
   * @param {string} roomId - Room ID
   */
  getUnreadCount: async (roomId) => {
    try {
      const response = await api.get(`/${roomId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Get all conversations for current user
   * @param {Object} options - Query options { limit, skip }
   */
  getConversations: async ({ limit = 20, skip = 0 } = {}) => {
    try {
      const response = await api.get('/conversations', {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  /**
   * Get or create a chat room with another user
   * @param {string} otherUserId - ID of the other user
   */
  getOrCreateRoom: async (otherUserId) => {
    try {
      const response = await api.post('/room', { otherUserId });
      return response.data;
    } catch (error) {
      console.error('Error getting or creating room:', error);
      throw error;
    }
  },
};

export default chatService;
