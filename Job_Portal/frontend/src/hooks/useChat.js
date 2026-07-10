import { create } from 'zustand';
import socketService from '@/services/websocket';
import chatService from '@/services/chatService';

/**
 * Zustand store for chat state
 */
const useChatStore = create((set, get) => ({
  // State
  currentRoomId: null,
  messages: [],
  conversations: [],
  isLoading: false,
  error: null,
  typingUsers: new Map(),
  unreadCounts: new Map(),
  selectedConversationId: null,

  /**
   * Initialize chat room
   */
  initializeRoom: async (roomId, userId) => {
    try {
      set({ isLoading: true, currentRoomId: roomId, error: null });

      // Fetch existing messages
      const response = await chatService.getMessages(roomId, { limit: 50 });
      set({ messages: response.data || [], isLoading: false });

      // Join room via socket
      socketService.emit('room:join', {
        roomId,
        userId,
      });

      // Listen for new messages
      socketService.on(`chat:new-message-${roomId}`, (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      // Listen for message edits
      socketService.on(`chat:message-edited-${roomId}`, (updatedMessage) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          ),
        }));
      });

      // Listen for message deletes
      socketService.on(`chat:message-deleted-${roomId}`, (messageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      });

      // Listen for typing indicators
      socketService.on(`chat:typing-${roomId}`, (data) => {
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          if (data.isTyping) {
            newTypingUsers.set(data.userId, {
              userId: data.userId,
              userName: data.userName,
            });
          } else {
            newTypingUsers.delete(data.userId);
          }
          return { typingUsers: newTypingUsers };
        });
      });

      // Listen for read receipts
      socketService.on(`chat:messages-read-${roomId}`, (data) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            data.messageIds.includes(msg._id)
              ? { ...msg, read: true, readBy: data.userId }
              : msg
          ),
        }));
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Leave current room
   */
  leaveRoom: (userId) => {
    const { currentRoomId } = get();
    if (currentRoomId) {
      socketService.emit('room:leave', {
        roomId: currentRoomId,
        userId,
      });
      socketService.removeAllListeners(`chat:new-message-${currentRoomId}`);
      socketService.removeAllListeners(`chat:message-edited-${currentRoomId}`);
      socketService.removeAllListeners(`chat:message-deleted-${currentRoomId}`);
      socketService.removeAllListeners(`chat:typing-${currentRoomId}`);
      socketService.removeAllListeners(`chat:messages-read-${currentRoomId}`);
    }
    set({ currentRoomId: null, messages: [], typingUsers: new Map() });
  },

  /**
   * Send a message
   */
  sendMessage: async (messageData) => {
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        ...messageData,
        timestamp: new Date(),
        read: false,
      };

      set((state) => ({
        messages: [...state.messages, tempMessage],
      }));

      // Send via socket for real-time delivery
      socketService.emit('chat:message', messageData);

      // Also save via API
      const response = await chatService.sendMessage(messageData);

      // Replace temp message with real one
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? response.data : msg
        ),
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message });
      // Remove temp message on error
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      throw error;
    }
  },

  /**
   * Edit a message
   */
  editMessage: async (messageId, content) => {
    try {
      const response = await chatService.editMessage(messageId, { content });
      socketService.emit('chat:edit', response.data);

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? response.data : msg
        ),
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      socketService.emit('chat:delete', { messageId });

      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Send typing indicator
   */
  sendTypingIndicator: (roomId, userId, userName, isTyping) => {
    socketService.emit('chat:typing', {
      roomId,
      userId,
      userName,
      isTyping,
    });
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (roomId, messageIds, userId) => {
    try {
      await chatService.markAsRead(roomId, messageIds);
      socketService.emit('chat:read', { roomId, messageIds, userId });

      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, read: true, readBy: userId }
            : msg
        ),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  /**
   * Search messages
   */
  searchMessages: async (roomId, query) => {
    try {
      set({ isLoading: true });
      const response = await chatService.searchMessages(roomId, query);
      set({ messages: response.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Load more messages (pagination)
   */
  loadMoreMessages: async (roomId, skip) => {
    try {
      set({ isLoading: true });
      const response = await chatService.getMessages(roomId, {
        limit: 50,
        skip,
      });

      set((state) => ({
        messages: [...response.data || [], ...state.messages],
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Fetch conversations list
   */
  fetchConversations: async () => {
    try {
      set({ isLoading: true });
      const response = await chatService.getConversations({ limit: 50 });
      set({ conversations: response.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Get or create room with another user
   */
  getOrCreateRoom: async (otherUserId) => {
    try {
      set({ isLoading: true });
      const response = await chatService.getOrCreateRoom(otherUserId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),

  /**
   * Get typing users list
   */
  getTypingUsers: () => {
    const { typingUsers } = get();
    return Array.from(typingUsers.values());
  },

  /**
   * Update unread count
   */
  updateUnreadCount: (roomId, count) => {
    set((state) => {
      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(roomId, count);
      return { unreadCounts: newUnreadCounts };
    });
  },

  /**
   * Get total unread messages
   */
  getTotalUnread: () => {
    const { unreadCounts } = get();
    return Array.from(unreadCounts.values()).reduce((a, b) => a + b, 0);
  },

  /**
   * Reset chat state
   */
  resetChat: () => {
    set({
      currentRoomId: null,
      messages: [],
      conversations: [],
      typingUsers: new Map(),
      unreadCounts: new Map(),
      error: null,
    });
  },
}));

/**
 * Hook to use chat state and methods
 */
export const useChat = () => {
  return useChatStore();
};

export default useChatStore;
