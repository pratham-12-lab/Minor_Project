import { useState, useRef, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

/**
 * MessageInput Component
 * Input field for composing and sending messages
 */
export const MessageInput = ({
  onSendMessage,
  roomId,
  userId,
  userName,
  isLoading = false,
  placeholder = 'Type your message here...',
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendTypingIndicator } = useChat();
  const typingTimeoutRef = useRef(null);

  // Handle typing indicator
  useEffect(() => {
    if (!message && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(roomId, userId, userName, false);
      return;
    }

    if (message && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(roomId, userId, userName, true);
    }

    // Clear typing indicator after user stops typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(roomId, userId, userName, false);
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, roomId, userId, userName, sendTypingIndicator]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    try {
      const messageData = {
        roomId,
        senderId: userId,
        senderName: userName,
        content: trimmedMessage,
        messageType: 'text',
        timestamp: new Date(),
      };

      await onSendMessage(messageData);
      setMessage('');
      setIsTyping(false);
      sendTypingIndicator(roomId, userId, userName, false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-end gap-2 p-4 bg-white border-t border-gray-200"
    >
      {/* Attachment button */}
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Attach file"
        title="Attach file"
      >
        <Plus size={20} />
      </button>

      {/* Message input */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        rows="1"
        className="
          flex-1 px-4 py-2 
          border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          resize-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors
        "
        style={{
          maxHeight: '120px',
          minHeight: '40px',
        }}
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="
          p-2 
          bg-blue-500 hover:bg-blue-600 
          text-white rounded-lg
          disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors
          flex items-center justify-center
        "
        aria-label="Send message"
        title="Send message (Enter to send)"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;
