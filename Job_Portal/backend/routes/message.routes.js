/**
 * Message Routes
 * REST API for message operations
 */

import express from 'express';
import Message from '../models/message.model.js';
import { User } from '../models/user.model.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { log } from '../utils/logger.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * GET /api/messages/:roomId
 * Get message history for a room
 */
router.get('/:roomId', isAuthenticated, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({
      roomId,
      deleted: false,
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    log.error(`Error fetching messages: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
});

/**
 * GET /api/messages/:roomId/search
 * Search messages in a room
 */
router.get('/:roomId/search', isAuthenticated, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query required',
      });
    }

    const messages = await Message.find(
      {
        roomId,
        deleted: false,
        content: { $regex: query, $options: 'i' },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    log.error(`Error searching messages: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to search messages',
    });
  }
});

/**
 * GET /api/messages/message/:messageId
 * Get single message
 */
router.get('/message/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    log.error(`Error fetching message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message',
    });
  }
});

/**
 * POST /api/messages/:roomId/mark-read
 * Mark messages as read
 */
router.post('/:roomId/mark-read', isAuthenticated, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        error: 'Message IDs required as array',
      });
    }

    const result = await Message.updateMany(
      { _id: { $in: messageIds } },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    log.error(`Error marking messages as read: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read',
    });
  }
});

/**
 * GET /api/messages/:roomId/unread-count
 * Get unread message count
 */
router.get('/:roomId/unread-count', isAuthenticated, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.id;

    const count = await Message.countDocuments({
      roomId,
      recipientId: userId,
      read: false,
      deleted: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    log.error(`Error getting unread count: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
});

/**
 * DELETE /api/messages/:messageId
 * Delete message (soft delete)
 */
router.delete('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Check authorization
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message',
      });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    log.error(`Error deleting message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
    });
  }
});

/**
 * PUT /api/messages/:messageId
 * Edit message
 */
router.put('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content required',
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Check authorization
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this message',
      });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    log.error(`Error editing message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to edit message',
    });
  }
});

/**
 * POST /api/messages
 * Send new message
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { roomId, recipientId, content, messageType = 'text' } = req.body;
    const senderId = req.id;

    if (!roomId || !recipientId || !content) {
      return res.status(400).json({
        success: false,
        error: 'roomId, recipientId, and content are required',
      });
    }

    const message = new Message({
      roomId,
      senderId,
      recipientId,
      content,
      messageType,
      timestamp: new Date(),
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    log.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
});

/**
 * POST /api/messages/room
 * Get or create room with another user
 */
router.post('/room', isAuthenticated, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.id;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        error: 'otherUserId is required',
      });
    }

    if (otherUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create room with yourself',
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate consistent room ID by sorting user IDs
    const userIds = [currentUserId, otherUserId].sort();
    const roomId = `room_${userIds[0]}_${userIds[1]}`;

    // Check if conversation already exists
    const existingMessage = await Message.findOne({ roomId }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        roomId,
        participantId: otherUserId,
        participantName: otherUser.fullname,
        exists: !!existingMessage,
        lastMessage: existingMessage || null,
      },
    });
  } catch (error) {
    log.error(`Error creating/finding room: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to create/find room',
    });
  }
});

/**
 * GET /api/messages/conversations
 * Get all conversations for current user
 */
router.get('/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;
    const { limit = 20, skip = 0 } = req.query;

    // Aggregate to get latest message per conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: new mongoose.Types.ObjectId(userId) }, { recipientId: new mongoose.Types.ObjectId(userId) }],
          deleted: false,
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$$ROOT' },
          participantId: {
            $first: {
              $cond: {
                if: { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
                then: '$recipientId',
                else: '$senderId',
              },
            },
          },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$recipientId', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$read', false] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'participantId',
          foreignField: '_id',
          as: 'participant',
        },
      },
      {
        $unwind: '$participant',
      },
      {
        $project: {
          roomId: '$_id',
          lastMessage: 1,
          participantId: 1,
          participantName: '$participant.fullname',
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.timestamp': -1 },
      },
      {
        $skip: parseInt(skip),
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    log.error(`Error fetching conversations: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
});

export default router;
