/**
 * Notification Routes
 * REST API for notification operations
 */

import express from 'express';
import Notification from '../models/notification.model.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { log } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for authenticated user
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;
    const { limit = 20, skip = 0, type, read } = req.query;

    let query = { userId };

    if (type) {
      query.type = type;
    }

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    log.error(`Error fetching notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;

    const count = await Notification.countDocuments({
      userId,
      read: false,
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
 * GET /api/notifications/:notificationId
 * Get single notification
 */
router.get('/:notificationId', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Check authorization
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    log.error(`Error fetching notification: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification',
    });
  }
});

/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.put('/:notificationId/read', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Check authorization
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    log.error(`Error marking notification as read: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to mark as read',
    });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    log.error(`Error marking all as read: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all as read',
    });
  }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete notification
 */
router.delete('/:notificationId', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Check authorization
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    log.error(`Error deleting notification: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

/**
 * DELETE /api/notifications/delete-all
 * Delete all notifications for user
 */
router.delete('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    log.error(`Error deleting all notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notifications',
    });
  }
});

/**
 * POST /api/notifications/test
 * Send a test notification (for development/testing)
 */
router.post('/test', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;
    const socketManager = req.app.get('socketManager');
    
    if (!socketManager) {
      return res.status(500).json({
        success: false,
        error: 'WebSocket not available',
      });
    }

    // Import test notification utility
    const { sendTestNotification } = await import('../utils/test-notifications.js');
    
    // Send test notification
    const notification = await sendTestNotification(userId, socketManager);
    
    res.status(200).json({
      success: true,
      message: 'Test notification sent successfully!',
      data: notification,
    });
  } catch (error) {
    log.error(`Error sending test notification: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
    });
  }
});

/**
 * POST /api/notifications/test-multiple
 * Send multiple test notifications (for development/testing)
 */
router.post('/test-multiple', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;
    const socketManager = req.app.get('socketManager');
    
    if (!socketManager) {
      return res.status(500).json({
        success: false,
        error: 'WebSocket not available',
      });
    }

    // Import test notification utility
    const { sendTestNotifications } = await import('../utils/test-notifications.js');
    
    // Send test notifications
    await sendTestNotifications(userId, socketManager);
    
    res.status(200).json({
      success: true,
      message: 'Multiple test notifications sent successfully!',
    });
  } catch (error) {
    log.error(`Error sending test notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notifications',
    });
  }
});

export default router;
