import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

/**
 * MessageList Component
 * Displays list of messages in a chat room
 */
export const MessageList = ({
  messages = [],
  currentUserId,
  isLoading = false,
  onLoadMore = () => {},
  typingUsers = [],
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { deleteMessage, editMessage } = useChat();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    if (!newContent.trim()) return;

    try {
      await editMessage(messageId, newContent);
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const startEdit = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditText(content);
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
    >
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-500">Loading messages...</div>
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <p className="text-lg font-semibold">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUserId;
        const isEditing = editingMessageId === message._id;

        return (
          <div
            key={message._id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                flex gap-2 max-w-xs
                ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}
              `}
            >
              {/* Avatar placeholder */}
              <div
                className={`
                  w-8 h-8 rounded-full flex-shrink-0
                  flex items-center justify-center text-white text-xs font-bold
                  ${isOwnMessage ? 'bg-blue-500' : 'bg-gray-400'}
                `}
              >
                {message.senderName?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Message bubble */}
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender name */}
                <span className="text-xs text-gray-600 mb-1">
                  {message.senderName}
                </span>

                {/* Message content or edit form */}
                <div
                  className={`
                    relative
                    px-4 py-2 rounded-lg
                    ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }
                    group
                  `}
                  onMouseEnter={() => setSelectedMessageId(message._id)}
                  onMouseLeave={() => setSelectedMessageId(null)}
                >
                  {isEditing ? (
                    <div className="flex gap-2 items-center">
                      <input
                        autoFocus
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className={`
                          border rounded px-2 py-1 text-sm
                          ${
                            isOwnMessage
                              ? 'bg-blue-600 border-blue-700 text-white'
                              : 'bg-white border-gray-300'
                          }
                        `}
                      />
                      <button
                        onClick={() => handleEditMessage(message._id, editText)}
                        className="p-1 hover:bg-green-500 rounded"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingMessageId(null);
                          setEditText('');
                        }}
                        className="p-1 hover:bg-red-500 rounded"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="break-words">{message.content}</p>
                      {message.edited && (
                        <span className="text-xs opacity-70 mt-1">(edited)</span>
                      )}
                    </>
                  )}
                </div>

                {/* Message metadata */}
                <div className="flex gap-2 items-center mt-1 text-xs text-gray-500">
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isOwnMessage && (
                    <span className="flex items-center gap-1">
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>

                {/* Message actions (visible on hover) */}
                {isOwnMessage && selectedMessageId === message._id && !isEditing && (
                  <div className="absolute -top-8 right-0 flex gap-1 bg-white border border-gray-200 rounded shadow-lg p-1">
                    <button
                      onClick={() => startEdit(message._id, message.content)}
                      className="p-1 hover:bg-blue-100 rounded"
                      title="Edit message"
                    >
                      <Edit2 size={14} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Delete message"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            {typingUsers.map((u) => u.userName).join(', ')} typing
          </span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
