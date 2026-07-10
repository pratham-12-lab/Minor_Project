import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, ThumbsUp, ThumbsDown, Loader2, MapPin, Briefcase, DollarSign, MessageCircle, Minimize2 } from 'lucide-react';
import { CHATBOT_API_END_POINT } from '../../utils/constant';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useSelector } from 'react-redux';

const MessageContent = ({ content }) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts = content.split(linkRegex);

  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
      {parts.map((part, index) => {
        if (index % 3 === 1) {
          const linkText = parts[index];
          const linkUrl = parts[index + 1];
          if (linkUrl && linkUrl.startsWith('http')) {
            return (
              <a key={index} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">
                {linkText}
              </a>
            );
          }
          if (linkUrl) {
            return (
              <Link key={index} to={linkUrl} className="text-blue-500 hover:underline font-medium">
                {linkText}
              </Link>
            );
          }
        } else if (index % 3 === 0) {
          const boldParts = part.split(boldRegex);
          return boldParts.map((boldPart, boldIndex) => {
            if (boldIndex % 2 === 1) {
              return <strong key={boldIndex} className="font-semibold text-gray-900">{boldPart}</strong>;
            }
            return boldPart;
          });
        }
        return null;
      })}
    </div>
  );
};

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const user = useSelector((state) => state?.auth?.user);

  // Initialize welcome message and session
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      const welcomeMessage = {
        role: 'assistant',
        content: user 
          ? `👋 Hello ${user.fullname || 'there'}! I'm your AI-powered career assistant.

🎯 **I can help you with:**
• Job search and recommendations
• Application status tracking 
• Profile optimization tips
• Interview preparation
• Skill gap analysis
• Career development advice

What specific career challenge can I help you tackle today?`
          : `👋 Welcome to our Job Portal! I'm your AI career assistant.

🎯 **I can help you with:**
• Job search and discovery
• Career guidance and tips  
• Interview preparation
• General career questions
• Industry insights

💡 **For personalized features**, please log in to your account.

What can I help you with today?`,
        timestamp: new Date(),
        jobs: [],
        applications: [],
        source: 'ai-powered',
        suggestions: user ? [
          'Show me my application status',
          'Find jobs in my field',
          'Check my profile completeness',
          'Help me prepare for interviews'
        ] : [
          'Find software engineer jobs',
          'Career tips for beginners',
          'How to prepare for interviews'
        ]
      };
      
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = user ? `${CHATBOT_API_END_POINT}/message` : `${CHATBOT_API_END_POINT}/chat`;
      const requestBody = user ? {
        message: userMessage.content,
        userId: user._id,
        userRole: user.role || 'student',
        sessionId: sessionId,
        conversationContext
      } : {
        message: userMessage.content,
        history: messages.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        conversationContext
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Server error occurred');
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          jobs: data.jobs || [],
          applications: data.applications || [],
          source: data.source || 'ai-powered',
          suggestions: data.suggestions || []
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.conversationContext) {
          setConversationContext(data.conversationContext);
        }
      } else {
        throw new Error(data.message || 'Failed to process message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorContent = !user && error.message.includes('authentication') 
        ? '🔐 For personalized features, please log in to your account. I can still help with general job search!'
        : `❌ Sorry, I encountered an error. Please try again.`;
      
      const errorMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        jobs: [],
        applications: [],
        source: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const JobCard = ({ job }) => (
    <div 
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/description/${job._id}`)}
    >
      <div className="flex items-start gap-3">
        {job.company?.logo && (
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={job.company.logo} alt={job.company.name} />
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h4>
          <p className="text-xs text-gray-600 truncate">{job.company?.name}</p>
          <div className="flex items-center gap-4 mt-2">
            {job.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{job.location}</span>
              </div>
            )}
            {job.jobType && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {job.jobType}
              </Badge>
            )}
            {job.salary > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <DollarSign className="h-3 w-3" />
                <span>{job.salary} LPA</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#6A38C2] to-[#5b30a6] hover:from-[#5b30a6] hover:to-[#4a2890] text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open AI Career Assistant"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          
          {/* AI Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">AI</span>
          </div>
        </button>
      )}

      {/* Responsive Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50">
          {/* Mobile Backdrop */}
          <div className="sm:hidden absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          {/* Chat Container */}
          <div className="bg-white h-full sm:h-[600px] w-full sm:w-96 sm:rounded-2xl shadow-2xl flex flex-col border-0 sm:border border-gray-200 relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6A38C2] to-[#5b30a6] text-white px-4 py-4 sm:rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">AI Career Assistant</h3>
                  <p className="text-sm text-white/90">
                    {user ? `Welcome ${user.fullname?.split(' ')[0]}! 👋` : 'Powered by AI 🤖'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-[#6A38C2] rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    {/* Message bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-[#6A38C2] text-white ml-auto'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <MessageContent content={msg.content} />
                      
                      {/* Message metadata */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                          {msg.source && (
                            <Badge variant="secondary" className="text-xs">
                              {msg.source === 'ai-powered' ? '🤖 AI' : 
                               msg.source === 'rule-based' ? '📋 Rules' : '⚡ Quick'}
                            </Badge>
                          )}
                          {msg.intent && msg.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {msg.intent} ({Math.round(msg.confidence * 100)}%)
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Job Results */}
                    {msg.jobs?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium text-gray-600">🔍 Found {msg.jobs.length} job{msg.jobs.length > 1 ? 's' : ''}</div>
                        {msg.jobs.slice(0, 3).map((job, jobIndex) => (
                          <JobCard key={jobIndex} job={job} />
                        ))}
                        {msg.jobs.length > 3 && (
                          <button 
                            onClick={() => navigate('/jobs')}
                            className="text-xs text-blue-500 hover:underline font-medium"
                          >
                            View all {msg.jobs.length} jobs →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Suggestions */}
                    {msg.suggestions?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium text-purple-600">💡 Quick Actions:</div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestions.slice(0, 4).map((suggestion, suggestionIdx) => {
                            const suggestionText = typeof suggestion === 'string' 
                              ? suggestion 
                              : suggestion?.message || suggestion?.text || 'Click to explore';
                            const suggestionAction = typeof suggestion === 'object' 
                              ? suggestion?.action 
                              : null;
                            
                            return (
                              <button
                                key={suggestionIdx}
                                onClick={() => {
                                  if (suggestionAction) {
                                    // Handle action-based suggestions
                                    if (suggestionAction === 'navigate' && suggestion.link) {
                                      navigate(suggestion.link);
                                    } else if (suggestionAction === 'search' && suggestion.query) {
                                      setInput(suggestion.query);
                                    }
                                  } else {
                                    // Handle text-based suggestions
                                    setInput(suggestionText);
                                  }
                                }}
                                className="text-left p-3 bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg text-purple-700 text-xs transition-all duration-200 font-medium"
                              >
                                {suggestionText}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 bg-[#6A38C2] rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6A38C2]" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white sm:rounded-b-2xl">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about jobs, career advice, or anything..."
                  className="flex-1 resize-none border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A38C2] focus:border-transparent transition-colors"
                  rows={1}
                  style={{ maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#6A38C2] hover:bg-[#5b30a6] disabled:bg-gray-300 text-white rounded-xl px-4 py-3 transition-colors flex-shrink-0 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;