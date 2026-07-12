import { useEffect, useState } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSelector } from 'react-redux';

/**
 * NotificationCenter Component
 * Displays list of notifications with filtering and actions
 */
export const NotificationCenter = ({ onClose, maxHeight = '500px' }) => {
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
    getByType,
    getUnread,
    getFilteredNotifications,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const { user, token } = useSelector(store => store.auth);

  // Wait for Redux to rehydrate from localStorage before fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch notifications after auth is ready
  useEffect(() => {
    if (hasCheckedAuth && user && token) {
      fetchNotifications({ limit: 20 }).catch(() => {
        // Silently handle errors to prevent console spam
      });
    }
  }, [hasCheckedAuth, user, token, fetchNotifications]);

  // Don't render notification center if user is not authenticated
  if (!user || !token) {
    return null;
  }

  const handleFilterChange = async (newFilter) => {
    setActiveFilter(newFilter);

    if (newFilter === 'all') {
      await fetchNotifications({ limit: 20 });
    } else if (newFilter === 'unread') {
      await getUnread();
    } else {
      await getByType(newFilter);
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'unread', label: 'Unread', icon: '🆕' },
    { value: 'MESSAGE', label: 'Messages', icon: '💬' },
    { value: 'APPLICATION', label: 'Applications', icon: '📝' },
    { value: 'INTERVIEW', label: 'Interviews', icon: '🎥' },
    { value: 'JOB_MATCH', label: 'Job Matches', icon: '💼' },
  ];

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
      MESSAGE: 'bg-blue-50 border-blue-200',
      APPLICATION: 'bg-purple-50 border-purple-200',
      INTERVIEW: 'bg-green-50 border-green-200',
      JOB_MATCH: 'bg-orange-50 border-orange-200',
      PROFILE_VIEW: 'bg-pink-50 border-pink-200',
      OFFER: 'bg-yellow-50 border-yellow-200',
      REMINDER: 'bg-gray-50 border-gray-200',
      ADMIN: 'bg-red-50 border-red-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-600">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1 hover:bg-gray-100 rounded text-xs text-blue-600"
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-3 border-b border-gray-200 overflow-x-auto">
        {notificationTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleFilterChange(type.value)}
            className={`
              px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all
              ${
                activeFilter === type.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="mr-1">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Notifications list */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight }}
      >
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        )}

        {!isLoading && filteredNotifications.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-400">
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          </div>
        )}

        {filteredNotifications.map((notification) => (
          <div
            key={notification._id}
            className={`
              border-b border-gray-100 p-3
              hover:bg-gray-50 transition-colors
              ${!notification.read ? 'bg-blue-50' : ''}
              ${getNotificationColor(notification.type)}
              border-l-4
            `}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <span className="text-2xl flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="p-1 hover:bg-white rounded text-blue-600"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="p-1 hover:bg-white rounded text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full absolute left-2 top-4" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 text-center">
        <a
          href="/notifications"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all notifications →
        </a>
      </div>
    </div>
  );
};

export default NotificationCenter;
