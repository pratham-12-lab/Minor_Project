/**
 * Test Notification Utility
 * Use this to test if your notification system is working
 */

import notificationHandler from '../websocket/notification-handler.js';

/**
 * Send a test notification to a user
 * @param {string} userId - Target user ID
 * @param {Object} socketManager - Socket manager instance
 */
export const sendTestNotification = async (userId, socketManager) => {
  try {
    const testNotification = {
      type: 'ADMIN',
      title: '🔔 Test Notification',
      message: 'This is a test notification to verify your real-time notification system is working!',
      actionUrl: '/notifications',
      relatedId: null,
    };

    const result = await notificationHandler.sendNotification(
      userId,
      testNotification,
      socketManager
    );

    console.log('✅ Test notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
    throw error;
  }
};

/**
 * Send multiple test notifications for different scenarios
 */
export const sendTestNotifications = async (userId, socketManager) => {
  const notifications = [
    {
      type: 'APPLICATION',
      title: 'New Job Application',
      message: 'John Doe applied for Senior Developer position',
      actionUrl: `/applications/test`,
    },
    {
      type: 'MESSAGE',
      title: 'New Message',
      message: 'Sarah: Hey, I saw your profile and...',
      actionUrl: `/messages/test`,
    },
    {
      type: 'JOB',
      title: 'New Job Match',
      message: 'New Senior React Developer position at TechCorp matches your skills!',
      actionUrl: `/jobs/test`,
    },
    {
      type: 'INTERVIEW',
      title: 'Interview Invitation',
      message: 'You have been invited for an interview tomorrow at 2 PM',
      actionUrl: `/interviews/test`,
    },
  ];

  try {
    for (const [index, notif] of notifications.entries()) {
      await new Promise(resolve => setTimeout(resolve, 1000 * index)); // Stagger notifications
      await notificationHandler.sendNotification(userId, notif, socketManager);
      console.log(`✅ Sent test notification ${index + 1}:`, notif.title);
    }
    
    console.log('✅ All test notifications sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test notifications:', error);
    throw error;
  }
};

export default { sendTestNotification, sendTestNotifications };