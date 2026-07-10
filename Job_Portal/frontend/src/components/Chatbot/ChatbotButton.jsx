import React, { useState } from 'react';
import { MessageSquare, Bot, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import EnhancedChatbot from './EnhancedChatbot';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state?.auth?.user);

  // Only show chatbot for authenticated users
  if (!user) return null;

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleChatbot}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isOpen 
              ? 'bg-red-600 hover:bg-red-700 rotate-180' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-110'
          }`}
          title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Notification Badge (could be used for unread messages) */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
            AI Career Assistant
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        )}
      </div>

      {/* Enhanced Chatbot Modal */}
      <EnhancedChatbot isOpen={isOpen} onToggle={toggleChatbot} />
    </>
  );
};

export default ChatbotButton;