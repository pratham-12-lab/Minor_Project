import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown, Star, Loader2, X, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const EnhancedChatbot = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const user = useSelector((state) => state?.auth?.user);

  // Initialize session and welcome message
  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Add welcome message
      const welcomeMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `👋 Hello ${user.fullname || 'there'}! I'm your AI career assistant. I can help you with:

🎯 **Job Search** - Find positions that match your skills
📝 **Profile Optimization** - Improve your profile completeness
🔍 **Application Tracking** - Check your application status
💼 **Interview Prep** - Practice with mock interviews
📊 **Skill Gap Analysis** - Identify missing skills for roles
🎨 **CV Optimization** - Match your CV to specific jobs

What can I help you with today?`,
        timestamp: new Date(),
        source: 'system',
        suggestions: [
          'Show me my application status',
          'Find software engineer jobs',
          'Check my profile completeness',
          'Start a mock interview'
        ]
      };
      
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chatbot/message`, {
        message: userMessage.content,
        userId: user._id,
        userRole: user.role || 'student',
        sessionId: sessionId,
        conversationContext
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        const assistantMessage = {
          id: response.data.messageId || Date.now(),
          type: 'assistant',
          content: response.data.reply,
          timestamp: new Date(),
          source: response.data.source,
          jobs: response.data.jobs || [],
          applications: response.data.applications || [],
          suggestions: response.data.suggestions || [],
          conversationId: response.data.conversationId
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Update conversation context if provided
        if (response.data.conversationContext) {
          setConversationContext(response.data.conversationContext);
        }
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        source: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId, conversationId, feedback) => {
    try {
      await axios.post(`${BACKEND_URL}/api/chatbot/feedback`, {
        conversationId,
        messageId,
        feedback
      }, {
        withCredentials: true
      });

      // Update the message to show feedback was given
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, feedbackGiven: feedback }
            : msg
        )
      );
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4 md:items-center md:justify-center">
      <div className="bg-white w-full h-full md:w-96 md:h-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold">AI Career Assistant</h3>
              <p className="text-sm opacity-90">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Avatar */}
                <div className={`flex items-center mb-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                </div>

                {/* Message bubble */}
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {/* Jobs display */}
                  {message.jobs?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-purple-600">💼 Available Jobs:</div>
                      {message.jobs.slice(0, 3).map((job, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border text-gray-800 text-sm">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-gray-600">{job.company.name} • {job.location}</div>
                          <div className="text-green-600">₹{job.salary} LPA</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Applications display */}
                  {message.applications?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-purple-600">📋 Your Applications:</div>
                      {message.applications.slice(0, 3).map((app, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border text-gray-800 text-sm">
                          <div className="font-medium">{app.jobTitle}</div>
                          <div className="text-gray-600">{app.companyName}</div>
                          <div className={`font-medium ${
                            app.status === 'accepted' ? 'text-green-600' :
                            app.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            Status: {app.status.toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-purple-600">💡 Quick Actions:</div>
                      <div className="space-y-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(typeof suggestion === 'string' ? suggestion : suggestion.message || '')}
                            className="block w-full text-left p-2 bg-white border border-purple-200 hover:border-purple-400 rounded text-purple-700 text-sm transition-colors"
                          >
                            {typeof suggestion === 'string' ? suggestion : suggestion.message || 'Unknown suggestion'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp and source */}
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.source && (
                      <span className="bg-black/10 px-2 py-0.5 rounded">
                        {message.source === 'ai-powered' ? '🤖 AI' : 
                         message.source === 'rule-based' ? '📋 Rules' : '⚡ Quick'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback buttons for assistant messages */}
                {message.type === 'assistant' && message.source !== 'system' && !message.feedbackGiven && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleFeedback(message.id, message.conversationId, { helpful: true, rating: 5 })}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Helpful"
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, message.conversationId, { helpful: false, rating: 2 })}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                )}

                {/* Feedback confirmation */}
                {message.feedbackGiven && (
                  <div className="mt-2 text-xs text-gray-500">
                    Thank you for your feedback! 
                    {message.feedbackGiven.helpful ? ' 👍' : ' 👎'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your career..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatbot;