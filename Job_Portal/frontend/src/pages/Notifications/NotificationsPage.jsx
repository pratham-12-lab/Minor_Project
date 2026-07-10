import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '@/hooks/useNotifications';
import { Trash2, Check, X, ArrowLeft } from 'lucide-react';

/**
 * NotificationsPage Component
 * Full page notifications view with filtering and management
 */
export const NotificationsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.profile);
  const token = useSelector((state) => state?.user?.token);

  const {
    isConnected,
    initializeSocket,
    disconnectSocket,
  } = useSocket();

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    filter,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getByType,
    getUnread,
    initializeNotifications,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Initialize socket and notifications
  useEffect(() => {
    if (!isConnected && token && user) {
      initializeSocket(
        token,
        user._id,
        user.fullName || user.email,
        user.role || 'CANDIDATE'
      );
    }
  }, [isConnected, initializeSocket, token, user]);

  // Initialize notifications
  useEffect(() => {
    if (isConnected && user) {
      initializeNotifications(user._id);
    }
  }, [isConnected, user, initializeNotifications]);

  const handleFilterChange = async (newFilter) => {
    setActiveFilter(newFilter);

    if (newFilter === 'all') {
      await fetchNotifications({ limit: 50 });
    } else if (newFilter === 'unread') {
      await getUnread();
    } else {
      await getByType(newFilter);
    }
  };

  const getNotificationIcon = (type) => {
    const typeIcons = {
      MESSAGE: '💬',
      APPLICATION: '📝',
      INTERVIEW: '🎥',
      JOB_MATCH: '💼',
      PROFILE_VIEW: '👁️',
      OFFER: '🎉',
      REMINDER: '⏰',
      ADMIN: '⚙️',
    };
    return typeIcons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      MESSAGE:
        'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100',
      APPLICATION:
        'border-l-4 border-l-purple-500 bg-purple-50 hover:bg-purple-100',
      INTERVIEW:
        'border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100',
      JOB_MATCH:
        'border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100',
      PROFILE_VIEW:
        'border-l-4 border-l-pink-500 bg-pink-50 hover:bg-pink-100',
      OFFER: 'border-l-4 border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100',
      REMINDER:
        'border-l-4 border-l-gray-500 bg-gray-50 hover:bg-gray-100',
      ADMIN: 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100',
    };
    return colors[type] || 'border-l-4 border-l-gray-500 bg-gray-50 hover:bg-gray-100';
  };

  const sortNotifications = (notifs) => {
    const sorted = [...notifs];
    if (sortBy === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
    } else if (sortBy === 'unread') {
      sorted.sort((a, b) => (a.read ? 1 : -1) - (b.read ? 1 : -1));
    }
    return sorted;
  };

  const displayNotifications = sortNotifications(notifications);

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} unread ${
                        unreadCount === 1 ? 'notification' : 'notifications'
                      }`
                    : 'All caught up!'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to delete all notifications?'
                      )
                    ) {
                      clearAll();
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filters and sorting */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
                { value: 'MESSAGE', label: 'Messages' },
                { value: 'APPLICATION', label: 'Applications' },
                { value: 'INTERVIEW', label: 'Interviews' },
                { value: 'JOB_MATCH', label: 'Job Matches' },
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => handleFilterChange(filterOption.value)}
                  className={`
                    px-4 py-2 rounded-lg whitespace-nowrap transition-all
                    ${
                      activeFilter === filterOption.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="unread">Unread first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Loading notifications...</div>
          </div>
        )}

        {!isLoading && displayNotifications.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          </div>
        )}

        {/* Notifications grid */}
        <div className="space-y-3">
          {displayNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`
                p-4 rounded-lg transition-all cursor-pointer
                ${getNotificationColor(notification.type)}
                ${!notification.read ? 'shadow-md' : 'shadow-sm'}
              `}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <span className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 text-sm mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1" />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-600">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>

                    {/* Type badge */}
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {notification.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check size={18} className="text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Action link */}
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
