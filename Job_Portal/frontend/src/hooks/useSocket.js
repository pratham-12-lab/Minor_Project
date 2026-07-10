import { create } from 'zustand';
import socketService from '@/services/websocket';

/**
 * Zustand store for socket connection state
 */
const useSocketStore = create((set) => ({
  isConnected: false,
  socketId: null,
  isReconnecting: false,
  error: null,
  onlineUsers: [],

  /**
   * Initialize socket connection
   */
  initializeSocket: (token, userId, userName, userRole) => {
    try {
      socketService.connect(token, userId, userName, userRole);

      // Listen to connection events
      socketService.on('socket:connected', (data) => {
        set({
          isConnected: true,
          socketId: data.socketId,
          isReconnecting: false,
          error: null,
        });
      });

      socketService.on('socket:disconnected', () => {
        set({ isConnected: false });
      });

      socketService.on('socket:error', (data) => {
        set({ error: data.error });
      });

      socketService.on('socket:reconnecting', () => {
        set({ isReconnecting: true });
      });

      socketService.on('socket:reconnected', () => {
        set({ isConnected: true, isReconnecting: false });
      });

      // Listen for online users list
      socketService.on('users:online', (users) => {
        set({ onlineUsers: users });
      });

      // Listen for user online status
      socketService.on('user:online', (user) => {
        set((state) => ({
          onlineUsers: [...state.onlineUsers, user],
        }));
      });

      // Listen for user offline status
      socketService.on('user:offline', (userId) => {
        set((state) => ({
          onlineUsers: state.onlineUsers.filter((u) => u.userId !== userId),
        }));
      });
    } catch (error) {
      set({ error: error.message });
    }
  },

  /**
   * Disconnect socket
   */
  disconnectSocket: () => {
    socketService.disconnect();
    set({
      isConnected: false,
      socketId: null,
      error: null,
      onlineUsers: [],
    });
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),

  /**
   * Check if user is online
   */
  isUserOnline: (userId) => {
    const { onlineUsers } = useSocketStore.getState();
    return onlineUsers.some((u) => u.userId === userId);
  },

  /**
   * Get all online user IDs
   */
  getOnlineUserIds: () => {
    const { onlineUsers } = useSocketStore.getState();
    return onlineUsers.map((u) => u.userId);
  },
}));

/**
 * Hook to use socket connection state and methods
 */
export const useSocket = () => {
  return useSocketStore();
};

export default useSocketStore;
