import { useEffect, useState } from 'react';
import { X, Info, ArrowLeft } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';

/**
 * ChatWindow Component
 * Main chat interface with message list and input
 */
export const ChatWindow = ({
  roomId,
  recipientId,
  recipientName,
  currentUserId,
  currentUserName,
  onClose,
  otherUserOnline = false,
}) => {
  const navigate = useNavigate();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    getTypingUsers,
    markAsRead,
    initializeRoom,
    leaveRoom,
  } = useChat();

  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    // Initialize room when component mounts
    if (roomId) {
      initializeRoom(roomId, currentUserId);
    }

    return () => {
      // Leave room when component unmounts
      if (roomId) {
        leaveRoom(currentUserId);
      }
    };
  }, [roomId, currentUserId, initializeRoom, leaveRoom]);

  // Update typing users
  useEffect(() => {
    const typing = getTypingUsers();
    setTypingUsers(typing);
  }, [getTypingUsers]);

  // Mark messages as read when they become visible
  useEffect(() => {
    const unreadMessageIds = messages
      .filter(
        (msg) =>
          msg.recipientId === currentUserId &&
          !msg.read
      )
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      markAsRead(roomId, unreadMessageIds, currentUserId);
    }
  }, [messages, roomId, currentUserId, markAsRead]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div
            className={`
              w-3 h-3 rounded-full
              ${otherUserOnline ? 'bg-green-500' : 'bg-gray-400'}
            `}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{recipientName}</h3>
            <p className="text-xs text-gray-500">
              {otherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Chat info"
          >
            <Info size={20} className="text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close chat"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
        typingUsers={typingUsers}
      />

      {/* Message input */}
      <MessageInput
        onSendMessage={sendMessage}
        roomId={roomId}
        userId={currentUserId}
        userName={currentUserName}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatWindow;
