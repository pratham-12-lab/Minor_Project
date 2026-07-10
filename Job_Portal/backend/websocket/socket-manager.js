/**
 * Socket.IO Manager
 * Manages WebSocket connections and events
 */

import { Server as SocketIOServer } from 'socket.io';
import { log } from '../utils/logger.js';

class SocketManager {
  constructor(server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5174',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.activeUsers = new Map(); // userId -> socket data
    this.rooms = new Map(); // roomId -> users in room
    this.typingUsers = new Map(); // roomId -> set of typing users
  }

  /**
   * Initialize Socket.IO event listeners
   */
  initialize(chatHandler, notificationHandler) {
    this.io.on('connection', (socket) => {
      log.info(`New socket connection: ${socket.id}`);

      // User authentication and registration
      socket.on('user:register', (userData) => {
        this.handleUserRegister(socket, userData);
      });

      // Chat events
      socket.on('chat:message', (messageData) => {
        chatHandler.handleMessage(socket, messageData, this);
      });

      socket.on('chat:typing', (typingData) => {
        this.handleTyping(socket, typingData);
      });

      socket.on('chat:read', (readData) => {
        chatHandler.handleMessageRead(socket, readData, this);
      });

      socket.on('chat:delete', (deleteData) => {
        chatHandler.handleMessageDelete(socket, deleteData, this);
      });

      socket.on('chat:edit', (editData) => {
        chatHandler.handleMessageEdit(socket, editData, this);
      });

      // Notification events
      socket.on('notification:subscribe', (userId) => {
        notificationHandler.handleNotificationSubscribe(socket, userId, this);
      });

      socket.on('notification:read', (notificationId) => {
        notificationHandler.handleNotificationRead(socket, notificationId, this);
      });

      // Room management
      socket.on('room:join', (roomData) => {
        this.handleRoomJoin(socket, roomData);
      });

      socket.on('room:leave', (roomId) => {
        this.handleRoomLeave(socket, roomId);
      });

      // Online status
      socket.on('user:online', (userData) => {
        this.broadcastUserStatus(socket, userData, 'online');
      });

      socket.on('user:offline', (userData) => {
        this.broadcastUserStatus(socket, userData, 'offline');
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handling
      socket.on('error', (error) => {
        log.error(`Socket error for ${socket.id}: ${error}`);
      });
    });
  }

  /**
   * Handle user registration
   */
  handleUserRegister(socket, userData) {
    const { userId, userName, userRole } = userData;

    if (!userId) {
      socket.emit('error', { message: 'User ID required' });
      return;
    }

    // Store user socket mapping
    this.activeUsers.set(userId, {
      socketId: socket.id,
      userName,
      userRole,
      connectedAt: new Date(),
      online: true,
    });

    // Store userId in socket for later reference
    socket.userId = userId;

    log.info(`User registered: ${userId} with socket ${socket.id}`);

    // Emit success
    socket.emit('user:registered', {
      success: true,
      userId,
      socketId: socket.id,
    });

    // Broadcast user is online
    this.io.emit('user:status', {
      userId,
      status: 'online',
      timestamp: new Date(),
    });
  }

  /**
   * Handle room join (for group chat)
   */
  handleRoomJoin(socket, roomData) {
    const { roomId, userId } = roomData;

    socket.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);

    log.info(`User ${userId} joined room ${roomId}`);

    // Notify others in room
    socket.to(roomId).emit('room:user-joined', {
      userId,
      roomId,
      timestamp: new Date(),
    });

    // Send room info to user
    socket.emit('room:joined', {
      roomId,
      usersInRoom: Array.from(this.rooms.get(roomId)),
    });
  }

  /**
   * Handle room leave
   */
  handleRoomLeave(socket, roomId) {
    const userId = socket.userId;

    socket.leave(roomId);

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);

      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }

    // Clean up typing status
    if (this.typingUsers.has(roomId)) {
      this.typingUsers.get(roomId).delete(userId);
    }

    log.info(`User ${userId} left room ${roomId}`);

    // Notify others in room
    socket.to(roomId).emit('room:user-left', {
      userId,
      roomId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle typing indicator
   */
  handleTyping(socket, typingData) {
    const { roomId, userId, isTyping } = typingData;

    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }

    if (isTyping) {
      this.typingUsers.get(roomId).add(userId);
    } else {
      this.typingUsers.get(roomId).delete(userId);
    }

    // Broadcast to room
    socket.to(roomId).emit('chat:user-typing', {
      userId,
      roomId,
      isTyping,
      typingUsers: Array.from(this.typingUsers.get(roomId)),
    });
  }

  /**
   * Broadcast user online/offline status
   */
  broadcastUserStatus(socket, userData, status) {
    const { userId } = userData;

    if (this.activeUsers.has(userId)) {
      const user = this.activeUsers.get(userId);
      user.online = status === 'online';
    }

    // Broadcast to all users
    this.io.emit('user:status-changed', {
      userId,
      status,
      timestamp: new Date(),
    });

    log.info(`User ${userId} is ${status}`);
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(socket) {
    const userId = socket.userId;

    if (userId) {
      this.activeUsers.delete(userId);

      // Clean up from all rooms
      for (const [roomId, users] of this.rooms) {
        users.delete(userId);
        if (users.size === 0) {
          this.rooms.delete(roomId);
        }
      }

      // Broadcast user is offline
      this.io.emit('user:status', {
        userId,
        status: 'offline',
        timestamp: new Date(),
      });

      log.info(`User ${userId} disconnected (socket ${socket.id})`);
    }
  }

  /**
   * Emit message to specific user
   */
  emitToUser(userId, event, data) {
    const user = this.activeUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }

  /**
   * Emit message to room
   */
  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Emit message to all except sender
   */
  emitToRoomExcept(roomId, socketId, event, data) {
    this.io.to(roomId).except(socketId).emit(event, data);
  }

  /**
   * Get active users count
   */
  getActiveUsersCount() {
    return this.activeUsers.size;
  }

  /**
   * Get users in room
   */
  getUsersInRoom(roomId) {
    if (this.rooms.has(roomId)) {
      return Array.from(this.rooms.get(roomId));
    }
    return [];
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.activeUsers.has(userId) && this.activeUsers.get(userId).online;
  }

  /**
   * Get user info
   */
  getUserInfo(userId) {
    return this.activeUsers.get(userId);
  }

  /**
   * Broadcast to all connected users
   */
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Gracefully shutdown
   */
  shutdown() {
    log.info('Shutting down Socket.IO');
    this.activeUsers.clear();
    this.rooms.clear();
    this.typingUsers.clear();
    this.io.close();
  }
}

export default SocketManager;
