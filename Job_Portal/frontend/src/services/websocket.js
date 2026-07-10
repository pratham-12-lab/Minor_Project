import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to the WebSocket server
   * @param {string} token - JWT authentication token
   * @param {string} userId - User ID
   * @param {string} userName - User full name
   * @param {string} userRole - User role (RECRUITER, CANDIDATE, ADMIN)
   */
  connect(token, userId, userName, userRole) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    try {
      this.socket = io(SOCKET_URL, {
        withCredentials: true, // Use cookies for auth
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        secure: SOCKET_URL.startsWith('https'),
        rejectUnauthorized: false, // For development
      });

      // Register user with socket server
      this.socket.emit('user:register', {
        userId,
        userName,
        userRole,
      });

      // Connection success
      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.emit('socket:connected', { socketId: this.socket.id });
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.emit('socket:error', { error: error.message });
      });

      // User registered
      this.socket.on('user:registered', (data) => {
        console.log('✅ User registered on socket:', data);
        this.emit('socket:user-registered', data);
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('⚠️  Socket disconnected:', reason);
        this.emit('socket:disconnected', { reason });
      });

      // Reconnection attempt
      this.socket.on('reconnect_attempt', () => {
        console.log('🔄 Attempting to reconnect...');
        this.emit('socket:reconnecting');
      });

      // Reconnection success
      this.socket.on('reconnect', () => {
        console.log('✅ Reconnected successfully');
        this.emit('socket:reconnected');
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Socket initialization error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  /**
   * Listen for socket event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Track listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  /**
   * Listen for socket event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      if (this.listeners.has(event)) {
        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * Emit socket event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Emit socket event and wait for response (promise-based)
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitAsync(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error(`Event ${event} timeout`));
      }, 5000);

      this.socket.emit(event, data, (error, result) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId() {
    return this.socket?.id;
  }

  /**
   * Remove all listeners for event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.socket?.removeAllListeners(event);
      this.listeners.delete(event);
    } else {
      this.socket?.removeAllListeners();
      this.listeners.clear();
    }
  }

  /**
   * Clean up all listeners and disconnect
   */
  cleanup() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => this.off(event, callback));
    });
    this.disconnect();
  }
}

// Export singleton instance
export default new SocketService();
