import { create } from 'zustand';
import socketService from '@/services/websocket';
import notificationService from '@/services/notificationService';

/**
 * Zustand store for notifications state
 */
const useNotificationsStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  filter: 'all', // all, unread, MESSAGE, APPLICATION, INTERVIEW, etc.

  /**
   * Initialize notifications
   */
  initializeNotifications: async (userId) => {
    try {
      set({ isLoading: true });

      // Fetch initial notifications
      const response = await notificationService.getNotifications({
        limit: 50,
      });
      set({
        notifications: response.data || [],
        unreadCount: response.unreadCount || 0,
        isLoading: false,
      });

      // Subscribe to socket notifications
      socketService.emit('notification:subscribe', userId);

      // Listen for new notifications
      socketService.on('notification:new', (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      });

      // Listen for notification read
      socketService.on('notification:read', (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      });

      // Listen for notification deleted
      socketService.on('notification:deleted', (notificationId) => {
        set((state) => {
          const wasUnread = state.notifications.find(
            (n) => n._id === notificationId
          )?.read === false;
          return {
            notifications: state.notifications.filter(
              (n) => n._id !== notificationId
            ),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        });
      });

      // Listen for all notifications read
      socketService.on('notification:all-read', () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            read: true,
          })),
          unreadCount: 0,
        }));
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Fetch notifications with filters
   */
  fetchNotifications: async (options = {}) => {
    try {
      set({ isLoading: true });
      const response = await notificationService.getNotifications(options);
      set({
        notifications: response.data || [],
        unreadCount: response.unreadCount || 0,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      set({ unreadCount: response.unreadCount || 0 });
      return response.unreadCount;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      socketService.emit('notification:read', notificationId);

      set((state) => {
        const wasUnread = state.notifications.find(
          (n) => n._id === notificationId
        )?.read === false;
        return {
          notifications: state.notifications.map((notif) =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      socketService.emit('notification:all-read');

      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      socketService.emit('notification:deleted', notificationId);

      set((state) => {
        const wasUnread = state.notifications.find(
          (n) => n._id === notificationId
        )?.read === false;
        return {
          notifications: state.notifications.filter(
            (n) => n._id !== notificationId
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Clear all notifications
   */
  clearAll: async () => {
    try {
      await notificationService.clearAll();
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Get notifications by type
   */
  getByType: async (type) => {
    try {
      set({ isLoading: true });
      const response = await notificationService.getByType(type, {
        limit: 50,
      });
      set({
        notifications: response.data || [],
        isLoading: false,
        filter: type,
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Get unread notifications only
   */
  getUnread: async () => {
    try {
      set({ isLoading: true });
      const response = await notificationService.getUnread({ limit: 50 });
      set({
        notifications: response.data || [],
        isLoading: false,
        filter: 'unread',
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Load more notifications (pagination)
   */
  loadMore: async (skip) => {
    try {
      set({ isLoading: true });
      const response = await notificationService.getNotifications({
        limit: 50,
        skip,
      });

      set((state) => ({
        notifications: [...state.notifications, ...(response.data || [])],
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Unsubscribe from notifications
   */
  unsubscribe: (userId) => {
    socketService.emit('notification:unsubscribe', userId);
    socketService.removeAllListeners('notification:new');
    socketService.removeAllListeners('notification:read');
    socketService.removeAllListeners('notification:deleted');
    socketService.removeAllListeners('notification:all-read');
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),

  /**
   * Get filtered notifications based on current filter
   */
  getFilteredNotifications: () => {
    const { notifications, filter } = get();

    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  },

  /**
   * Reset notifications
   */
  resetNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      error: null,
      filter: 'all',
    });
  },
}));

/**
 * Hook to use notifications state and methods
 */
export const useNotifications = () => {
  return useNotificationsStore();
};

export default useNotificationsStore;
