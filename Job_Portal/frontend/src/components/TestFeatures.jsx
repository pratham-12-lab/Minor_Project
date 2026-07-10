import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import profileViewService from '../services/profileViewService';
import notificationService from '../services/notificationService';

const TestFeatures = () => {
  const [loading, setLoading] = useState({});

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const testNotification = async () => {
    try {
      setLoadingState('notification', true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/notifications/test',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Test notification sent! Check your notifications.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setLoadingState('notification', false);
    }
  };

  const testMultipleNotifications = async () => {
    try {
      setLoadingState('multipleNotifications', true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/notifications/test-multiple',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Multiple test notifications sent! Check your notifications.');
    } catch (error) {
      console.error('Error sending multiple notifications:', error);
      toast.error('Failed to send test notifications');
    } finally {
      setLoadingState('multipleNotifications', false);
    }
  };

  const addFakeProfileViews = async () => {
    try {
      setLoadingState('profileViews', true);
      await profileViewService.addFakeViews(10);
      toast.success('Added 10 fake profile views! Go to Profile Views to see them.');
    } catch (error) {
      console.error('Error adding fake views:', error);
      toast.error('Failed to add fake profile views');
    } finally {
      setLoadingState('profileViews', false);
    }
  };

  const clearProfileViews = async () => {
    try {
      setLoadingState('clearViews', true);
      await profileViewService.clearAllViews();
      toast.success('All profile views cleared!');
    } catch (error) {
      console.error('Error clearing views:', error);
      toast.error('Failed to clear profile views');
    } finally {
      setLoadingState('clearViews', false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🧪 Test New Features</h2>
      
      <div className="space-y-4">
        {/* Test Notifications */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">📢 Real-time Notifications</h3>
          <div className="space-y-3">
            <button
              onClick={testNotification}
              disabled={loading.notification}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading.notification ? 'Sending...' : 'Send Test Notification'}
            </button>
            
            <button
              onClick={testMultipleNotifications}
              disabled={loading.multipleNotifications}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {loading.multipleNotifications ? 'Sending...' : 'Send Multiple Test Notifications'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            These will send real-time notifications that you can see in the notification bell icon.
          </p>
        </div>

        {/* Test Profile Views */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">👀 Profile Views</h3>
          <div className="space-y-3">
            <button
              onClick={addFakeProfileViews}
              disabled={loading.profileViews}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading.profileViews ? 'Adding...' : 'Add 10 Fake Profile Views'}
            </button>
            
            <button
              onClick={clearProfileViews}
              disabled={loading.clearViews}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading.clearViews ? 'Clearing...' : 'Clear All Profile Views'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Add realistic fake profile views from recruiters or clear all existing views.
          </p>
        </div>

        {/* Feature Links */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🚀 New Features to Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/student/profile/views"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
            >
              📊 Profile Views
            </a>
            <a
              href="/notifications"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
            >
              🔔 Notifications
            </a>
            <a
              href="/recruiter/dashboard"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
            >
              📈 Recruiter Dashboard
            </a>
            <a
              href="/recruiter/candidates/search"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
            >
              🔍 Candidate Search
            </a>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 How to Test:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Send Test Notification" and watch the notification bell</li>
            <li>• Add fake profile views and check the Profile Views page</li>
            <li>• Apply for jobs to test real application notifications</li>
            <li>• Use the Recruiter Dashboard if you have recruiter access</li>
            <li>• Test the enhanced application review with skills matching</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestFeatures;