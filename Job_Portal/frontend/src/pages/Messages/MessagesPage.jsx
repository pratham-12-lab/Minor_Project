import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '@/hooks/useSocket';
import { useChat } from '@/hooks/useChat';
import { MessageCircle, Search, Users, Bug, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { debugAuth, testAuthAPI } from '@/utils/authDebug';

/**
 * MessagesPage Component
 * Main page for viewing conversations and navigating to chats
 */
export const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isConnected, initializeSocket, getOnlineUserIds } = useSocket();
  const { conversations, fetchConversations } = useChat();

  // Get current user from Redux
  const user = useSelector((state) => state?.auth?.user);
  const token = localStorage.getItem('token');

  // Initialize socket connection on mount
  useEffect(() => {
    if (!isConnected && token && user) {
      try {
        initializeSocket(
          token,
          user._id,
          user.fullName || user.email,
          user.role || 'CANDIDATE'
        );
      } catch (err) {
        console.error('Failed to initialize socket:', err);
        setError('Failed to connect. Please try again.');
      }
    }
  }, [isConnected, initializeSocket, token, user]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        await fetchConversations();
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [fetchConversations, user, token]);

  // Redirect to login if not authenticated
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600 mb-4">Please log in to access messages.</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Filter conversations based on search term
  const filteredConversations = conversations?.filter(conv => 
    conv.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onlineUserIds = getOnlineUserIds();

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationClick = (conversation) => {
    if (conversation.roomId) {
      navigate(`/chat/${conversation.roomId}`);
    } else if (conversation.participantId) {
      // Create or find room with this participant
      navigate(`/chat/user/${conversation.participantId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8 p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:translate-x-[-2px]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                  <MessageCircle className="h-8 w-8" />
                </div>
                Messages
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                <Users className="h-4 w-4 text-indigo-600" />
                <span className="text-indigo-700 font-medium">
                  {onlineUserIds.length} online
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
            {/* Debug button - remove in production */}
            <Button 
              onClick={() => { debugAuth(); testAuthAPI(); }} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Bug className="h-4 w-4" />
              Debug Auth
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 transition-all duration-200 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <p className="text-yellow-800">Connecting to chat server...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading conversations...</span>
            </div>
          </div>
        )}

        {/* Conversations List */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 mb-4">
                  Start chatting by applying to jobs or connecting with recruiters
                </p>
                <Button onClick={() => navigate('/jobs')} variant="outline">
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation, index) => {
                  const isOnline = conversation.participantId && onlineUserIds.includes(conversation.participantId);
                  
                  return (
                    <div
                      key={conversation.roomId || `conv-${index}`}
                      onClick={() => handleConversationClick(conversation)}
                      className="group p-5 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-300 border border-transparent hover:border-indigo-100 hover:shadow-lg transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <span className="text-white font-bold text-xl">
                              {conversation.participantName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full animate-pulse shadow-lg"></div>
                          )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-indigo-700 transition-colors duration-200">
                              {conversation.participantName || 'Unknown User'}
                            </h3>
                            {conversation.lastMessage?.timestamp && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate group-hover:text-gray-700 transition-colors duration-200 leading-relaxed">
                              {conversation.lastMessage.senderId === user._id && (
                                <span className="text-indigo-600 font-medium">You: </span>
                              )}
                              {conversation.lastMessage.content || 'No message content'}
                            </p>
                          )}
                          
                          {!conversation.lastMessage && (
                            <p className="text-sm text-gray-400 italic">No messages yet - Start a conversation</p>
                          )}
                        </div>

                        {/* Unread Count */}
                        {conversation.unreadCount > 0 && (
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-bounce">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;