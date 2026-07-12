import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSelector } from 'react-redux';

/**
 * NotificationBell Component
 * Displays notification icon with unread count badge
 */
export const NotificationBell = ({ onClick, className = '' }) => {
  const { unreadCount, getUnreadCount } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const { user } = useSelector(store => store.auth);
  const token = localStorage.getItem('token');

  // Wait for Redux to rehydrate from localStorage before fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch unread count after auth is ready
  useEffect(() => {
    if (hasCheckedAuth && user && token) {
      getUnreadCount().catch(() => {
        // Silently handle errors to prevent console spam
      });
    }
  }, [hasCheckedAuth, user, getUnreadCount]);

  useEffect(() => {
    // Animate when unread count changes
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Don't render notification bell if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={onClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        aria-label="Notifications"
        title="View notifications"
      >
        <Bell
          size={24}
          className={`transition-transform duration-200 ${
            isAnimating ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className={`
              absolute -top-1 -right-1 
              flex items-center justify-center
              w-5 h-5 
              bg-red-500 text-white text-xs font-bold rounded-full
              transition-all duration-200
              ${isAnimating ? 'scale-110 shadow-lg' : 'scale-100'}
            `}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
