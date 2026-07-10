/**
 * Notification Handler
 * Handles all notification-related events
 */

import Notification from '../models/notification.model.js';
import { log } from '../utils/logger.js';

class NotificationHandler {
  /**
   * Create notification
   */
  async createNotification(userId, notificationData) {
    try {
      const {
        type, // 'APPLICATION', 'MESSAGE', 'INTERVIEW', 'JOB', 'PROFILE', 'ADMIN'
        title,
        message,
        actionUrl,
        relatedId,
      } = notificationData;

      const notification = new Notification({
        userId,
        type,
        title,
        message,
        actionUrl,
        relatedId,
        read: false,
        createdAt: new Date(),
      });

      await notification.save();

      log.info(`Notification created for user ${userId}: ${type}`);

      return notification;
    } catch (error) {
      log.error(`Error creating notification: ${error.message}`);
      return null;
    }
  }

  /**
   * Handle notification subscription
   */
  handleNotificationSubscribe(socket, userId, socketManager) {
    socket.on(`notification:${userId}`, (data) => {
      // This allows us to send notifications to specific users
      log.info(`User ${userId} subscribed to notifications`);
    });
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId, notificationData, socketManager) {
    try {
      // Create notification in database
      const notification = await this.createNotification(userId, notificationData);

      if (notification) {
        // Emit to user if online
        socketManager.emitToUser(userId, 'notification:new', {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
          timestamp: notification.createdAt,
        });
      }

      return notification;
    } catch (error) {
      console.error(`Error sending notification: ${error.message}`);
      return null;
    }
  }

  /**
   * Handle notification read
   */
  async handleNotificationRead(socket, notificationId, socketManager) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        {
          read: true,
          readAt: new Date(),
        },
        { new: true }
      );

      log.info(`Notification marked as read: ${notificationId}`);

      socket.emit('notification:read-confirmed', { notificationId });
    } catch (error) {
      log.error(`Error marking notification as read: ${error.message}`);
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        read: false,
      });

      return count;
    } catch (error) {
      log.error(`Error getting unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId, limit = 20, skip = 0) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return notifications;
    } catch (error) {
      log.error(`Error fetching notifications: ${error.message}`);
      return [];
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true, readAt: new Date() }
      );

      log.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);

      return result.modifiedCount;
    } catch (error) {
      log.error(`Error marking all as read: ${error.message}`);
      return 0;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);

      log.info(`Notification deleted: ${notificationId}`);

      return result;
    } catch (error) {
      log.error(`Error deleting notification: ${error.message}`);
      return null;
    }
  }

  /**
   * Broadcast system notification to all users
   */
  async broadcastSystemNotification(message, socketManager) {
    try {
      socketManager.broadcastToAll('notification:system', {
        message,
        timestamp: new Date(),
      });

      log.info(`System notification broadcast: ${message}`);
    } catch (error) {
      log.error(`Error broadcasting system notification: ${error.message}`);
    }
  }

  /**
   * Notification types and templates
   */
  static NotificationTypes = {
    APPLICATION: 'APPLICATION',
    MESSAGE: 'MESSAGE',
    INTERVIEW: 'INTERVIEW',
    JOB: 'JOB',
    PROFILE: 'PROFILE',
    ADMIN: 'ADMIN',
    OFFER: 'OFFER',
    RECOMMENDATION: 'RECOMMENDATION',
  };

  /**
   * Get notification template
   */
  static getNotificationTemplate(type, data) {
    const templates = {
      APPLICATION: {
        title: `New Application`,
        message: `${data.candidateName} applied for ${data.jobTitle}`,
        actionUrl: `/applications/${data.applicationId}`,
      },
      MESSAGE: {
        title: `New Message`,
        message: `${data.senderName}: ${data.messagePreview}...`,
        actionUrl: `/chat/${data.roomId}`,
      },
      INTERVIEW: {
        title: `Interview Scheduled`,
        message: `Interview for ${data.jobTitle} scheduled for ${data.interviewDate}`,
        actionUrl: `/interviews/${data.interviewId}`,
      },
      JOB: {
        title: `Job Recommended`,
        message: `Check out this job: ${data.jobTitle}`,
        actionUrl: `/jobs/${data.jobId}`,
      },
      OFFER: {
        title: `Offer Received`,
        message: `You received an offer for ${data.jobTitle}`,
        actionUrl: `/offers/${data.offerId}`,
      },
      RECOMMENDATION: {
        title: `Recommended Candidate`,
        message: `${data.candidateName} might be a good fit for ${data.jobTitle}`,
        actionUrl: `/candidates/${data.candidateId}`,
      },
    };

    return templates[type] || { title: 'Notification', message: 'You have a new notification' };
  }
}

export default new NotificationHandler();
