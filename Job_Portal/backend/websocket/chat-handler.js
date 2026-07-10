/**
 * Chat Handler
 * Handles all chat-related events
 */

import Message from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { requestLogger } from '../utils/logger.js';
import notificationHandler from './notification-handler.js';

class ChatHandler {
  /**
   * Handle new message
   */
  async handleMessage(socket, messageData, socketManager) {
    try {
      const { roomId, senderId, recipientId, content, messageType = 'text' } = messageData;

      if (!roomId || !senderId || !content) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Create message document
      const message = new Message({
        roomId,
        senderId,
        recipientId,
        content,
        messageType, // 'text', 'image', 'file', 'emoji'
        timestamp: new Date(),
        read: false,
        edited: false,
        deleted: false,
      });

      // Save to database
      await message.save();

      requestLogger.info(`Message created: ${message._id} in room ${roomId}`);

      // Broadcast to room
      socketManager.emitToRoom(roomId, 'chat:new-message', {
        _id: message._id,
        roomId,
        senderId,
        recipientId,
        content,
        messageType,
        timestamp: message.timestamp,
        read: false,
        edited: false,
        deleted: false,
      });

      // Emit delivery confirmation to sender
      socket.emit('chat:message-delivered', {
        messageId: message._id,
        timestamp: message.timestamp,
      });

      // 🔔 NEW: Send notification to recipient if they're not in the room or offline
      if (recipientId && recipientId !== senderId) {
        try {
          const recipient = await User.findById(recipientId);
          const sender = await User.findById(senderId);
          
          if (recipient && sender) {
            // Check if recipient is in the room (actively viewing chat)
            const isRecipientInRoom = socketManager.getUsersInRoom(roomId).includes(recipientId);
            
            if (!isRecipientInRoom) {
              // Get message preview (first 50 characters)
              const messagePreview = content.length > 50 
                ? content.substring(0, 47) + '...' 
                : content;

              await notificationHandler.sendNotification(
                recipientId,
                {
                  type: 'MESSAGE',
                  title: 'New Message',
                  message: `${sender.fullname || sender.email}: ${messagePreview}`,
                  actionUrl: `/messages/${roomId}`,
                  relatedId: message._id,
                },
                socketManager
              );
            }
          }
        } catch (error) {
          requestLogger.error(`Error sending message notification: ${error.message}`);
        }
      }

      // Clear typing status
      socketManager.handleTyping(socket, {
        roomId,
        userId: senderId,
        isTyping: false,
      });

    } catch (error) {
      requestLogger.error(`Error handling message: ${error.message}`);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle message read
   */
  async handleMessageRead(socket, readData, socketManager) {
    try {
      const { messageIds, roomId } = readData;

      // Update messages as read
      await Message.updateMany(
        { _id: { $in: messageIds } },
        {
          read: true,
          readAt: new Date(),
        }
      );

      requestLogger.info(`${messageIds.length} messages marked as read in room ${roomId}`);

      // Broadcast read status
      socketManager.emitToRoom(roomId, 'chat:messages-read', {
        messageIds,
        readAt: new Date(),
      });

    } catch (error) {
      requestLogger.error(`Error marking messages as read: ${error.message}`);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  /**
   * Handle message edit
   */
  async handleMessageEdit(socket, editData, socketManager) {
    try {
      const { messageId, content, roomId, senderId } = editData;

      // Find and update message
      const message = await Message.findById(messageId);

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Verify sender is the author
      if (message.senderId.toString() !== senderId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      message.content = content;
      message.edited = true;
      message.editedAt = new Date();

      await message.save();

      requestLogger.info(`Message edited: ${messageId}`);

      // Broadcast edit
      socketManager.emitToRoom(roomId, 'chat:message-edited', {
        messageId,
        content,
        editedAt: message.editedAt,
        edited: true,
      });

    } catch (error) {
      requestLogger.error(`Error editing message: ${error.message}`);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  }

  /**
   * Handle message delete
   */
  async handleMessageDelete(socket, deleteData, socketManager) {
    try {
      const { messageId, roomId, senderId } = deleteData;

      // Find message
      const message = await Message.findById(messageId);

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Verify sender is the author
      if (message.senderId.toString() !== senderId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      message.deleted = true;
      message.deletedAt = new Date();
      message.content = '[Message deleted]';

      await message.save();

      requestLogger.info(`Message deleted: ${messageId}`);

      // Broadcast delete
      socketManager.emitToRoom(roomId, 'chat:message-deleted', {
        messageId,
        deletedAt: message.deletedAt,
      });

    } catch (error) {
      requestLogger.error(`Error deleting message: ${error.message}`);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  }

  /**
   * Get message history
   */
  async getMessageHistory(roomId, limit = 50, skip = 0) {
    try {
      const messages = await Message.find({ roomId, deleted: false })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      requestLogger.error(`Error fetching message history: ${error.message}`);
      return [];
    }
  }

  /**
   * Search messages
   */
  async searchMessages(roomId, searchQuery) {
    try {
      const messages = await Message.find(
        {
          roomId,
          deleted: false,
          content: { $regex: searchQuery, $options: 'i' },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .lean();

      return messages;
    } catch (error) {
      requestLogger.error(`Error searching messages: ${error.message}`);
      return [];
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId, roomId) {
    try {
      const count = await Message.countDocuments({
        roomId,
        recipientId: userId,
        read: false,
        deleted: false,
      });

      return count;
    } catch (error) {
      requestLogger.error(`Error getting unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Delete old messages (cleanup job)
   */
  async deleteOldMessages(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await Message.deleteMany({
        timestamp: { $lt: cutoffDate },
        deleted: true, // Only delete already soft-deleted messages
      });

      requestLogger.info(`Deleted ${result.deletedCount} old messages`);
      return result.deletedCount;
    } catch (error) {
      requestLogger.error(`Error deleting old messages: ${error.message}`);
      return 0;
    }
  }
}

export default new ChatHandler();
