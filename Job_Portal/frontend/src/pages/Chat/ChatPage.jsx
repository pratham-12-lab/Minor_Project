import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket';
import { useChat } from '@/hooks/useChat';
import ChatWindow from '@/components/ChatWindow';
import { useSelector } from 'react-redux';

/**
 * ChatPage Component
 * Main page for chat functionality
 */
export const ChatPage = () => {
  const navigate = useNavigate();
  const { roomId, userId } = useParams(); // Handle both roomId and userId params
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [error, setError] = useState(null);
  const [actualRoomId, setActualRoomId] = useState(roomId);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const { isConnected, initializeSocket, disconnectSocket, getOnlineUserIds } =
    useSocket();
  const { fetchConversations, getOrCreateRoom } = useChat();

  // Get current user from Redux
  const user = useSelector((state) => state?.auth?.user);
  const token = localStorage.getItem('token');

  // Wait for Redux to rehydrate
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

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

    return () => {
      // Don't disconnect on unmount - keep connection alive
      // disconnectSocket();
    };
  }, [isConnected, initializeSocket, token, user]);

  // Handle userId route - create or find room with specific user
  useEffect(() => {
    const handleUserChat = async () => {
      if (userId && !roomId && user && token && hasCheckedAuth) {
        try {
          const response = await getOrCreateRoom(userId);
          if (response.success) {
            setActualRoomId(response.data.roomId);
            setRecipientInfo({
              userId: userId,
              userName: response.data.participantName || 'User'
            });
          }
        } catch (err) {
          console.error('Failed to create/find room:', err);
          setError('Failed to start conversation');
        }
      }
    };

    handleUserChat();
  }, [userId, roomId, user, token, hasCheckedAuth, getOrCreateRoom]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        await fetchConversations();
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    if (isConnected && hasCheckedAuth) {
      loadConversations();
    }
  }, [isConnected, fetchConversations, hasCheckedAuth]);

  // Get online status of recipient
  const onlineUserIds = getOnlineUserIds();
  const isRecipientOnline = recipientInfo?.userId
    ? onlineUserIds.includes(recipientInfo.userId)
    : false;

  const handleChatClose = () => {
    navigate('/messages');
  };

  // Show loading while Redux rehydrates
  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access messages.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Connecting...</p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate('/messages')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!actualRoomId && !userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Select a conversation to start chatting</p>
          <button
            onClick={() => navigate('/messages')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <ChatWindow
        roomId={actualRoomId || roomId}
        recipientId={recipientInfo?.userId}
        recipientName={recipientInfo?.userName || 'User'}
        currentUserId={user._id}
        currentUserName={user.fullName || user.email}
        onClose={handleChatClose}
        otherUserOnline={isRecipientOnline}
      />
    </div>
  );
};

export default ChatPage;
